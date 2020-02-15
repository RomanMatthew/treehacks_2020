class WorldData {
    constructor() {
        this.trees = [];
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
}

let instance = new WorldData();

export default instance;