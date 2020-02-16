import PointCloudLayer from './PointCloudLayer';
import TiledDataLayer from './TiledDataLayer.js';
import ProceduralPointCloudLayer from './ProceduralPointCloudLayer';
import ImageLayer from './ImageLayer';
window.TiledDataLayer = TiledDataLayer;

// Ported from Stefan Gustavson's java implementation
// http://staffwww.itn.liu.se/~stegu/simplexnoise/simplexnoise.pdf
// Read Stefan's excellent paper for details on how this code works.
//
// Sean McCullough banksean@gmail.com

/**
 * You can pass in a random number generator object if you like.
 * It is assumed to have a random() method.
 */
var SimplexNoise = function(r) {
	if (r === undefined) r = Math;
  this.grad3 = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0], 
                                 [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1], 
                                 [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]]; 
  this.p = [];
  for (let i=0; i<256; i++) {
	  this.p[i] = Math.floor(r.random()*256);
  }
  // To remove the need for index wrapping, double the permutation table length 
  this.perm = []; 
  for(let i=0; i<512; i++) {
		this.perm[i]=this.p[i & 255];
	} 

  // A lookup table to traverse the simplex around a given point in 4D. 
  // Details can be found where this table is used, in the 4D noise method. 
  this.simplex = [ 
    [0,1,2,3],[0,1,3,2],[0,0,0,0],[0,2,3,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,3,0], 
    [0,2,1,3],[0,0,0,0],[0,3,1,2],[0,3,2,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,3,2,0], 
    [0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0], 
    [1,2,0,3],[0,0,0,0],[1,3,0,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,3,0,1],[2,3,1,0], 
    [1,0,2,3],[1,0,3,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,3,1],[0,0,0,0],[2,1,3,0], 
    [0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0], 
    [2,0,1,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,0,1,2],[3,0,2,1],[0,0,0,0],[3,1,2,0], 
    [2,1,0,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,1,0,2],[0,0,0,0],[3,2,0,1],[3,2,1,0]]; 
};

SimplexNoise.prototype.dot = function(g, x, y) { 
	return g[0]*x + g[1]*y;
};

SimplexNoise.prototype.noise = function(xin, yin) { 
  var n0, n1, n2; // Noise contributions from the three corners 
  // Skew the input space to determine which simplex cell we're in 
  var F2 = 0.5*(Math.sqrt(3.0)-1.0); 
  var s = (xin+yin)*F2; // Hairy factor for 2D 
  var i = Math.floor(xin+s); 
  var j = Math.floor(yin+s); 
  var G2 = (3.0-Math.sqrt(3.0))/6.0; 
  var t = (i+j)*G2; 
  var X0 = i-t; // Unskew the cell origin back to (x,y) space 
  var Y0 = j-t; 
  var x0 = xin-X0; // The x,y distances from the cell origin 
  var y0 = yin-Y0; 
  // For the 2D case, the simplex shape is an equilateral triangle. 
  // Determine which simplex we are in. 
  var i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords 
  if(x0>y0) {i1=1; j1=0;} // lower triangle, XY order: (0,0)->(1,0)->(1,1) 
  else {i1=0; j1=1;}      // upper triangle, YX order: (0,0)->(0,1)->(1,1) 
  // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and 
  // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where 
  // c = (3-sqrt(3))/6 
  var x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords 
  var y1 = y0 - j1 + G2; 
  var x2 = x0 - 1.0 + 2.0 * G2; // Offsets for last corner in (x,y) unskewed coords 
  var y2 = y0 - 1.0 + 2.0 * G2; 
  // Work out the hashed gradient indices of the three simplex corners 
  var ii = i & 255; 
  var jj = j & 255; 
  var gi0 = this.perm[ii+this.perm[jj]] % 12; 
  var gi1 = this.perm[ii+i1+this.perm[jj+j1]] % 12; 
  var gi2 = this.perm[ii+1+this.perm[jj+1]] % 12; 
  // Calculate the contribution from the three corners 
  var t0 = 0.5 - x0*x0-y0*y0; 
  if(t0<0) n0 = 0.0; 
  else { 
    t0 *= t0; 
    n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0);  // (x,y) of grad3 used for 2D gradient 
  } 
  var t1 = 0.5 - x1*x1-y1*y1; 
  if(t1<0) n1 = 0.0; 
  else { 
    t1 *= t1; 
    n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1); 
  }
  var t2 = 0.5 - x2*x2-y2*y2; 
  if(t2<0) n2 = 0.0; 
  else { 
    t2 *= t2; 
    n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2); 
  } 
  // Add contributions from each corner to get the final noise value. 
  // The result is scaled to return values in the interval [-1,1]. 
  return 70.0 * (n0 + n1 + n2); 
};

class WorldData {
    constructor() {
        const treeGreen = [128, 160, 64];
        const newTreeGreen = [64, 255, 200];

        this.sourceImages = new ImageLayer();

        this.newTreeSize = 4.0;
        this.newTreeDensity = 0.6;

        this.trees = new PointCloudLayer(treeGreen, 128.0);
        let generator = (layer, x, y, w, h) => {
            this.generateNewTrees(layer, x, y, w, h);
        };
        this.newTrees = new ProceduralPointCloudLayer(newTreeGreen, 128.0, generator);
        this.densityModifier = new TiledDataLayer(64.0, value => {
            if (value > 0.0) {
                return [0, 1, 1, value];
            } else {
                return [1, 0, 0, -value];
            }
        });
        window.genDemo = this.generateDummyData.bind(this);
    }

    generateNewTrees(layer, x, y, w, h) {
        let treeMultiplier = (4.0 / this.newTreeSize);
        treeMultiplier *= treeMultiplier;
        for (let i = 0; i < 500 * treeMultiplier; i++) {
            let px = x + w * Math.random();
            let py = y + h * Math.random();
            let densityMod = this.densityModifier.read(px, py);
            let existingDensity = this.trees.approximateDensity(px, py, 200.0);
            let targetDensity = Math.max(Math.min(densityMod + this.newTreeDensity, 1.0), 0.0) * 0.6;
            let probability = (1.0 - existingDensity / targetDensity) * (targetDensity / 0.6);
            let r = this.newTreeSize * (Math.random() * 0.5 + 0.8);
            if (
                Math.random() < probability
                && !this.newTrees.checkForCollision(px, py, r) 
                && !this.trees.checkForCollision(px, py, r)
            ) {
                layer.addPoint(px, py, r);
            }
        }
    }

    generateDummyData() {
        let simplex = new SimplexNoise();
        this.newTrees.markEverythingDirty();
        for (let x = 0; x < 50000; x += 13) {
            for (let y = 0; y < 50000; y += 13) {
                if (Math.random() > simplex.noise(x / 10000.0, y / 10000.0) * 0.7 + 0.2) continue;
                let xx = x + Math.random() * 15.0;
                let yy = y + Math.random() * 15.0;
                let r;
                if (Math.random() < 0.2) {
                    r = Math.random() * 5.0 + 5.0;
                } else {
                    r = Math.random() * 3.0 + 3.0;
                }
                if (this.trees.checkForCollision(xx, yy, r)) continue;
                this.trees.addPoint(xx, yy, r);
            }
        }
    }
}

let instance = new WorldData();

export default instance;