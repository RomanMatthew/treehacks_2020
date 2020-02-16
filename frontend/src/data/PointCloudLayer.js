import TiledDataLayer from './TiledDataLayer.js';

function areaOfCircle(radius) {
    return Math.PI * radius * radius;
}

// This is used to figure out how much area of a circle lies within a radius of
// another point.
function areaOfIntersectingCircles(radius1, radius2, distanceBetweenCenters) {
    // http://mathworld.wolfram.com/Circle-CircleIntersection.html
    let d = distanceBetweenCenters;
    let rr = radius1;
    let r = radius2;
    return Math.sqrt((r-rr-d) * (rr-r-d) * (rr+r-d) * (rr+r+d)) / d;
}

export default class PointCloudLayer {
    // Data is internally divided into tiles. Having a larger tile size will
    // speed up large-scale operations but slow down small-scale operations.
    constructor(color, tileSize) {
        this.tileSize = tileSize;
        this.tiles = {};
        this.color = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
        this.mipmapResolutionDivisor = 2.0;
        this.mipmap = new TiledDataLayer(
            this.tileSize / this.mipmapResolutionDivisor, 
            value => [color[0] / 255, color[1] / 255, color[2] / 255, value]
        );
        this.mipPixelArea = (tileSize / this.mipmapResolutionDivisor);
        this.mipPixelArea *= this.mipPixelArea;
    }

    _getTile(tx, ty) {
        let identifier = `${tx}:${ty}`; 
        if (!this.tiles[identifier]) {
            this.tiles[identifier] = [];
        }
        return this.tiles[identifier];
    }

    addPoint(x, y, r) {
        let tx = Math.floor(x / this.tileSize);
        let ty = Math.floor(y / this.tileSize);
        let tile = this._getTile(tx, ty);
        tile.push({ x: x, y: y, r: r });
        // This is a good enough approximation of the area of coverage in every
        // pixel.
        let mipValue = this.mipmap.read(x, y);
        mipValue += areaOfCircle(r) / this.mipPixelArea;
        this.mipmap.write(x, y, mipValue);
    }

    // Collects all points which might overlap with the given region.
    _collectPointsAround(x, y, r) {
        let tr = Math.ceil(r / this.tileSize);
        let ctx = Math.floor(x / this.tileSize);
        let cty = Math.floor(y / this.tileSize);
        let result = [];
        for (let tx = ctx - tr; tx <= ctx + tr; tx++) {
            for (let ty = cty - tr; ty <= cty + tr; ty++) {
                result = result.concat(this._getTile(tx, ty));
            }
        }
        return result;
    }

    // Computes the amount of space filled in the circle defined by the 
    // provided arguments. Note that this does not take into account overlapping
    // points, so if any of those exist, the result may be artificially high.
    computeDensity(x, y, r) {
        let coveredArea = 0.0;
        for (let possiblePoint of this._collectPointsAround(x, y, r + 50.0)) {
            let dx = x - possiblePoint.x;
            let dy = y - possiblePoint.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance - possiblePoint.r > r) {
                // The point is outside our search area.
                continue;
            } else if (distance + possiblePoint.r > r) {
                // The point is partially inside our search area.
                coveredArea += areaOfIntersectingCircles(r, possiblePoint.r, distance);
            } else {
                // The point is completely inside our search area.
                coveredArea += areaOfCircle(possiblePoint.r);
            }
        }
        return coveredArea / areaOfCircle(r);
    }

    drawPoint(c, x, y, r) {
        c.strokeStyle = this.color;
        c.lineWidth = 2;
        c.fillStyle = c.strokeStyle;

        if (r > 7.0) {
            c.beginPath();
            c.ellipse(x, y, r, r, 0, 0, Math.PI * 2.0);
            c.stroke();
            c.beginPath();
            c.ellipse(x, y, 3, 3, 0, 0, Math.PI * 2.0);
            c.fill();
        } else if (r > 4.0) {
            c.beginPath();
            c.ellipse(x, y, r, r, 0, 0, Math.PI * 2.0);
            c.fill();
        } else {
            c.fillRect(x-r, y-r, r, r);
        }
    }

    drawToContext(context, x1, y1, x2, y2) {
        let tx1 = Math.floor(x1 / this.tileSize);
        let ty1 = Math.floor(y1 / this.tileSize);
        let tx2 = Math.floor(x2 / this.tileSize);
        let ty2 = Math.floor(y2 / this.tileSize);

        let screenWidth = context.canvas.width;
        let screenHeight = context.canvas.height;
        let screenXPerPixel = screenWidth / (x2 - x1);
        let screenYPerPixel = screenHeight / (y2 - y1);
        let screenLengthPerRadius = (screenXPerPixel + screenYPerPixel) / 2;

        let mipPixelSize = (screenXPerPixel * this.tileSize) / this.mipmapResolutionDivisor;
        console.log(mipPixelSize);
        // If the mipmap would have sufficient resolution, draw it instead 
        // because it's much less of a load on the browser.
        if (mipPixelSize < 16.0) {
            this.mipmap.drawToContext(context, x1, y1, x2, y2);
            return;
        }

        for (let tx = tx1; tx <= tx2; tx++) {
            for (let ty = ty1; ty <= ty2; ty++) {
                let tile = this._getTile(tx, ty);
                for (let point of tile) {
                    this.drawPoint(
                        context, 
                        (point.x - x1) * screenXPerPixel,
                        (point.y - y1) * screenYPerPixel,
                        point.r * screenLengthPerRadius,
                    );
                }
            }
        }
    }
}