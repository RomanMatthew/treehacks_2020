import PointCloudLayer from './PointCloudLayer.js';

const GENERATE_QUEUE_MAX_LENGTH = 256;

export default class ProceduralPointCloudLayer extends PointCloudLayer {
    // tileGenerator: (layer, x, y, w, h) => void
    constructor(color, tileSize, tileGenerator) {
        super(color, tileSize);
        this.tileSize *= 2;
        this.mipmapResolutionDivisor *= 2;
        this.tileVersionHashes = {};
        this.versionHash = 1;
        this.tileGenerator = tileGenerator;
        this.generateQueue = [];
        this._doAsyncWork();
    }

    _doAsyncWork() {
        // Proccesss up to GENERATE_QUEUE_MAX_LENGTH items before taking a breka.
        for (let limit = 0; limit < GENERATE_QUEUE_MAX_LENGTH / 4; limit++) {
            if (this.generateQueue.length > 0) {
                let nextItem = this.generateQueue.pop();
                if (this._getTileVersion(nextItem[0], nextItem[1]) === this.versionHash) continue;
                this._generateTile(nextItem[0], nextItem[1]);
            } else {
                // If we run out of work, wait longer to start back up next time.
                setTimeout(() => this._doAsyncWork(), 50);
                return;
            }
        }
        setTimeout(() => this._doAsyncWork(), 5);
    }

    _getTile(tx, ty) {
        let identifier = `${tx}:${ty}`; 
        if (!this.tiles[identifier]) {
            this.tiles[identifier] = [];
            // A version hash of zero means the tile has never been written to.
            this.tileVersionHashes[identifier] = 0;
        }
        return this.tiles[identifier];
    }

    _getTileVersion(tx, ty) {
        let identifier = `${tx}:${ty}`; 
        if (!this.tiles[identifier]) {
            this.tiles[identifier] = [];
            this.tileVersionHashes[identifier] = 0;
        }
        return this.tileVersionHashes[identifier];
    }

    _clearTile(tx, ty) {
        this.mipmap.clearSegment(
            tx * this.tileSize, 
            ty * this.tileSize, 
            this.tileSize,
            this.tileSize,
        );
        let identifier = `${tx}:${ty}`; 
        this.tiles[identifier] = [];
        this.tileVersionHashes[identifier] = 0;
    }

    // Clears tile if it is dirty.
    _cleanupTile(tx, ty) {
        if (this._getTileVersion(tx, ty) < this.versionHash) {
            this._clearTile(tx, ty);
        }
    }

    _generateTile(tx, ty) {
        this._clearTile(tx, ty);
        for (let dx = 0; dx < 3; dx++) {
            for (let dy = 0; dy < 3; dy++) {
                this._cleanupTile(tx + dx - 1, ty + dy - 1);
            }
        }
        let identifier = `${tx}:${ty}`; 
        this.tileVersionHashes[identifier] = this.versionHash;
        this.tileGenerator(
            this, 
            tx * this.tileSize, 
            ty * this.tileSize, 
            this.tileSize, 
            this.tileSize
        );
    }
    
    // Marks every tile generated as being out of date. (This is actually very
    // fast to do, don't hesitate to do it.)
    markEverythingDirty() {
        this.versionHash++;
    }

    markAreaDirty(cx, cy, r) {
        cx = Math.floor(cx / this.tileSize);
        cy = Math.floor(cy / this.tileSize);
        let tr = Math.ceil(r / this.tileSize) + 1;
        for (let dx = -tr; dx <= tr; dx++) {
            for (let dy = -tr; dy <= tr; dy++) {
                this._clearTile(cx + dx, cy + dy);
            }
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
        // If the mipmap would have sufficient resolution, draw it instead 
        // because it's much less of a load on the browser.
        let useMipmap = mipPixelSize < 16.0;

        for (let tx = tx1; tx <= tx2; tx++) {
            for (let ty = ty1; ty <= ty2; ty++) {
                let version = this._getTileVersion(tx, ty);
                if (version < this.versionHash) {
                    if (this.generateQueue.length < GENERATE_QUEUE_MAX_LENGTH) {
                        this.generateQueue.push([tx, ty]);
                    }
                    continue;
                }
                let tile = this._getTile(tx, ty);
                if (useMipmap) {
                    this.mipmap.drawSegmentToContext(
                        context, 
                        tx * this.tileSize, 
                        ty * this.tileSize, 
                        this.tileSize,
                        this.tileSize,
                        (tx * this.tileSize - x1) * screenXPerPixel,
                        (ty * this.tileSize - y1) * screenYPerPixel,
                        this.tileSize * screenXPerPixel,
                        this.tileSize * screenYPerPixel,
                    );
                } else {
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
}