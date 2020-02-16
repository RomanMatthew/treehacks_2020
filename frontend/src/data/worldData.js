import TiledDataLayer from './TiledDataLayer.js';
window.TiledDataLayer = TiledDataLayer;

class WorldData {
    constructor() {
        this.trees = [];
        this.densityModifier = new TiledDataLayer(64.0, value => {
            if (value > 0.0) {
                return [0, 1, 1, value];
            } else {
                return [1, 0, 0, -value];
            }
        });
        this.generateDummyData();
    }

    generateDummyData() {
        for (let x = 0; x < 1000; x += 20) {
            for (let y = 0; y < 1000; y += 20) {
                if (Math.random() < 0.5) continue;
                let xx = x + Math.random() * 5.0;
                let yy = y + Math.random() * 5.0;
                let r = Math.random() * 10.0 + 3.0;
                this.trees.push({
                    x: xx,
                    y: yy,
                    r: r,
                });
            }
        }
    }

    drawTiledDataToContext(context, x1, y1, x2, y2)  {
        this.densityModifier.drawToContext(context, x1, y1, x2, y2);
    }
}

let instance = new WorldData();

export default instance;