import React from 'react';
import styles from './PrimaryCanvas.module.css';
import worldData from '../data/worldData.js';

class PrimaryCanvas extends React.Component {
    constructor(props) {
        super(props);
        this.canvasRef = React.createRef();
        this.bg = '#101820';
        this.treeGreen = '#A0FF40';

        this.cameraX = 0;
        this.cameraY = 0;
        this.zoomLevel = 1.0;
        this.oldMouseX = 0;
        this.oldMouseY = 0;
        this.mouseDown = false;
    }

    componentDidMount() {
        let canvas = this.canvasRef.current;
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        this.context = canvas.getContext('2d');
        this.drawCanvas();

        this.resizeHandler = () => {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
            this.drawCanvas();
        };
        this.clickHandler = event => {
            this.oldMouseX = event.clientX;
            this.oldMouseY = event.clientY;
            this.mouseDown = true;
        }
        this.dragHandler = event => {
            if (!this.mouseDown) return;
            let deltaX = event.clientX - this.oldMouseX;
            let deltaY = event.clientY - this.oldMouseY;
            this.oldMouseX = event.clientX;
            this.oldMouseY = event.clientY;
            this.cameraX -= deltaX / this.zoomLevel;
            this.cameraY -= deltaY / this.zoomLevel;
            this.drawCanvas();
        };
        this.mouseUpHandler = () => {
            this.mouseDown = false;
        };
        this.wheelHandler = event => {
            this.zoomLevel *= Math.pow(2.0, event.deltaY * -0.05);
            this.drawCanvas();
        };
        window.addEventListener('resize', this.resizeHandler);
        canvas.addEventListener('mousedown', this.clickHandler);
        canvas.addEventListener('mousemove', this.dragHandler);
        canvas.addEventListener('mouseup', this.mouseUpHandler);
        canvas.addEventListener('wheel', this.wheelHandler);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resizeHandler);
    }

    transformX(coord) {
        let canvas = this.canvasRef.current;
        return (coord - this.cameraX) * this.zoomLevel + canvas.width / 2;
    }

    transformY(coord) {
        let canvas = this.canvasRef.current;
        return (coord - this.cameraY) * this.zoomLevel + canvas.height / 2;
    }

    transformLength(length) {
        return length * this.zoomLevel;
    }

    clearCanvas() {
        let c = this.context;
        c.fillStyle = this.bg;
        c.fillRect(0, 0, 9000, 9000);
    }

    drawTree(tree) {
        let x = tree.x;
        let y = tree.y;
        let radius = tree.r;

        let c = this.context;
        c.strokeStyle = this.treeGreen;
        c.lineWidth = 2;
        c.fillStyle = this.treeGreen;

        c.beginPath();
        c.ellipse(
            this.transformX(x),
            this.transformY(y),
            this.transformLength(radius),
            this.transformLength(radius),
            0.0,
            0.0,
            Math.PI * 2.0,
        );
        c.stroke();
        c.beginPath();
        c.ellipse(
            this.transformX(x),
            this.transformY(y),
            3.0,
            3.0,
            0.0,
            0.0,
            Math.PI * 2.0,
        );
        c.fill();
    }

    drawCanvas() {
        this.clearCanvas();

        for (let tree of worldData.trees) {
            this.drawTree(tree);
        }
    }

    render() {
        return (
            <div className={styles.container}>
                <canvas className={styles.canvas} ref={this.canvasRef}></canvas>
            </div>
        );
    }
}

export default PrimaryCanvas;