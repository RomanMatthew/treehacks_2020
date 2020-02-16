const TILE_SIZE = 64; // Tiles hold a 64x64 grid of values.

let dataStorageCanvas = document.createElement('canvas');
dataStorageCanvas.width = TILE_SIZE;
dataStorageCanvas.height = TILE_SIZE;
let dataStorageContext = dataStorageCanvas.getContext('2d');
window.dsc = dataStorageCanvas;

class DataTile {
    constructor(pixelShader) {
        this.values = new Array(TILE_SIZE * TILE_SIZE);
        this.values.fill(0);
        this.imageBuffer = dataStorageContext.createImageData(TILE_SIZE, TILE_SIZE);
        this.imageBufferUpdateRequired = true;
        this.pixelShader = pixelShader;
    }

    read(px, py) {
        return this.values[px + py * TILE_SIZE];
    }

    write(px, py, value) {
        this.values[px + py * TILE_SIZE] = value;
        this.imageBufferUpdateRequired = true;
    }

    updateImageBuffer() {
        let buf = this.imageBuffer;
        let pixelIndex = 0;
        for (let y = 0; y < TILE_SIZE; y++) {
            for (let x = 0; x < TILE_SIZE; x++) {
                let rgba = this.pixelShader(this.values[pixelIndex]);
                buf.data[pixelIndex * 4 + 0] = rgba[0] * 255;
                buf.data[pixelIndex * 4 + 1] = rgba[1] * 255;
                buf.data[pixelIndex * 4 + 2] = rgba[2] * 255;
                buf.data[pixelIndex * 4 + 3] = rgba[3] * 255;
                pixelIndex += 1;
            }
        }
        this.imageBufferUpdateRequired = false;
    }

    getImageBuffer() {
        if (this.imageBufferUpdateRequired) {
            this.updateImageBuffer();
        }
        return this.imageBuffer;
    }
}

export default class TiledDataLayer {
    constructor(pixelSize, pixelShader) {
        this.pixelSize = pixelSize;
        this.pixelShader = pixelShader;
        this.tiles = {};
    }

    _getTile(tx, ty) {
        let identifier = `${tx}:${ty}`; 
        if (!this.tiles[identifier]) {
            this.tiles[identifier] = new DataTile(this.pixelShader);
        }
        return this.tiles[identifier];
    }

    read(x, y) {
        x /= this.pixelSize;
        y /= this.pixelSize;
        let tilex = Math.floor(x / TILE_SIZE);
        let tiley = Math.floor(y / TILE_SIZE);
        let pixelx = Math.floor(x - tilex * TILE_SIZE);
        let pixely = Math.floor(y - tiley * TILE_SIZE);
        return this._getTile(tilex, tiley).read(pixelx, pixely);
    }

    write(x, y, value) {
        x /= this.pixelSize;
        y /= this.pixelSize;
        let tilex = Math.floor(x / TILE_SIZE);
        let tiley = Math.floor(y / TILE_SIZE);
        let pixelx = Math.floor(x - tilex * TILE_SIZE);
        let pixely = Math.floor(y - tiley * TILE_SIZE);
        return this._getTile(tilex, tiley).write(pixelx, pixely, value);
    }

    drawToContext(context, x1, y1, x2, y2) {
        x1 /= this.pixelSize;
        y1 /= this.pixelSize;
        x2 /= this.pixelSize;
        y2 /= this.pixelSize;
        let tx1 = Math.floor(x1 / TILE_SIZE);
        let ty1 = Math.floor(y1 / TILE_SIZE);
        let tx2 = Math.floor(x2 / TILE_SIZE);
        let ty2 = Math.floor(y2 / TILE_SIZE);
        
        let screenWidth = context.canvas.width;
        let screenHeight = context.canvas.height;
        let screenXPerPixel = screenWidth / (x2 - x1);
        let screenYPerPixel = screenHeight / (y2 - y1);
        let screenXPerTile = Math.floor(screenXPerPixel * TILE_SIZE);
        let screenYPerTile = Math.floor(screenYPerPixel * TILE_SIZE);
        let originTileScreenX = Math.floor((tx1 * TILE_SIZE - x1) * screenXPerPixel);
        let originTileScreenY = Math.floor((ty1 * TILE_SIZE - y1) * screenYPerPixel);
        for (let tx = tx1; tx <= tx2; tx++) {
            for (let ty = ty1; ty <= ty2; ty++) {
                let tile = this._getTile(tx, ty);
                let buffer = tile.getImageBuffer();
                let x = (tx - tx1) * screenXPerTile + originTileScreenX;
                let y = (ty - ty1) * screenYPerTile + originTileScreenY;
                dataStorageContext.putImageData(buffer, 0, 0);
                context.drawImage(
                    dataStorageCanvas,
                    0, 0, TILE_SIZE, TILE_SIZE, 
                    x, y, screenXPerTile, screenYPerTile
                );
            }
        }
    }
}
