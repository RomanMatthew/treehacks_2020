import React from 'react';
import styles from './PrimaryCanvas.module.css';
import worldData from '../data/worldData.js';

class PrimaryCanvas extends React.Component {
    constructor(props) {
        super(props);
        this.canvasRef = React.createRef();
        this.treeGreen = '#80A040';
        this.newTreeGreen = '#A0FF40';

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
            this.onClick(event.clientX, event.clientY);
        }
        this.dragHandler = event => {
            if (!this.mouseDown) return;
            let deltaX = event.clientX - this.oldMouseX;
            let deltaY = event.clientY - this.oldMouseY;
            this.oldMouseX = event.clientX;
            this.oldMouseY = event.clientY;
            this.onDrag(deltaX, deltaY, event.clientX, event.clientY);
        };
        this.mouseUpHandler = () => {
            this.mouseDown = false;
        };
        this.wheelHandler = event => {
            this.onScroll(event.deltaY);
        };
        window.addEventListener('resize', this.resizeHandler);
        canvas.addEventListener('mousedown', this.clickHandler);
        canvas.addEventListener('mousemove', this.dragHandler);
        canvas.addEventListener('mouseup', this.mouseUpHandler);
        canvas.addEventListener('mouseleave', this.mouseUpHandler);
        canvas.addEventListener('wheel', this.wheelHandler);
    }

    onClick(x, y) {
        let tool = this.props.toolset.active;
    }

    onDrag(dx, dy, nx, ny) {
        let tool = this.props.toolset.active;
        if (tool === 'pan') {
            this.cameraX -= dx / this.zoomLevel;
            this.cameraY -= dy / this.zoomLevel;
            this.drawCanvas();
        }
    }

    onScroll(ds) {
        let tool = this.props.toolset.active;
        if (tool === 'pan') {
            this.zoomLevel *= Math.pow(2.0, ds * -0.05);
            this.drawCanvas();
        }
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
        c.clearRect(0, 0, c.canvas.width, c.canvas.height);
    }

    drawTree(tree) {
        let x = tree.x;
        let y = tree.y;
        let radius = tree.r;

        let c = this.context;
        if (tree.new) {
            c.strokeStyle = this.newTreeGreen;
        } else {
            c.strokeStyle = this.treeGreen;
        }
        c.lineWidth = 2;
        c.fillStyle = c.strokeStyle;

        if (this.transformLength(radius) > 5.0) {
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
        } else {
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
            c.fill();
        }
    }

    drawCanvas() {
        this.context = this.canvasRef.current.getContext('2d');
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