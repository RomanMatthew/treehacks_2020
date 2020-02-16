import React from 'react';
import styles from './PrimaryCanvas.module.css';
import worldData from '../data/worldData.js';
import tools from '../tools/tools.js';

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

    _getActiveTool() {
        return tools.find(t => t.name === this.props.toolset.active);
    }

    _buildEventContext() {
        return {
            toolset: this.props.toolset,
            afterToolsetChange: () => this.props.onToolsetChange(this.props.toolset),
            dataview: this,
            worldData: worldData,
        }
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
            let bbox = this.canvasRef.current.getBoundingClientRect();
            this.oldMouseX = event.clientX - bbox.left
            this.oldMouseY = event.clientY - bbox.top;
            this.mouseDown = true;
            let redraw = this._getActiveTool().onClick(
                this._buildEventContext(),
                this.inverseTransformX(this.oldMouseX),
                this.inverseTransformY(this.oldMouseY),
            );
            if (redraw) this.drawCanvas();
        }
        this.dragHandler = event => {
            if (!this.mouseDown) return;
            let bbox = this.canvasRef.current.getBoundingClientRect();
            let deltaX = event.clientX - bbox.left - this.oldMouseX;
            let deltaY = event.clientY - bbox.top - this.oldMouseY;
            this.oldMouseX += deltaX;
            this.oldMouseY += deltaY;
            let redraw = this._getActiveTool().onDrag(
                this._buildEventContext(),
                deltaX / this.zoomLevel,
                deltaY / this.zoomLevel,
                this.inverseTransformX(this.oldMouseX),
                this.inverseTransformY(this.oldMouseY),
            );
            if (redraw) this.drawCanvas();
        };
        this.mouseUpHandler = () => {
            this.mouseDown = false;
        };
        this.wheelHandler = event => {
            let redraw = this._getActiveTool().onScroll(
                this._buildEventContext(),
                event.deltaY
            );
            if (redraw) this.drawCanvas();
        };
        window.addEventListener('resize', this.resizeHandler);
        canvas.addEventListener('mousedown', this.clickHandler);
        canvas.addEventListener('mousemove', this.dragHandler);
        canvas.addEventListener('mouseup', this.mouseUpHandler);
        canvas.addEventListener('mouseleave', this.mouseUpHandler);
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

    inverseTransformX(coord) {
        let canvas = this.canvasRef.current;
        return (coord - canvas.width / 2) / this.zoomLevel + this.cameraX;
    }

    inverseTransformY(coord) {
        let canvas = this.canvasRef.current;
        return (coord - canvas.height / 2) / this.zoomLevel + this.cameraY;
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

        this.context.globalAlpha = 0.7;
        let x1 = -this.context.canvas.width / 2 / this.zoomLevel + this.cameraX;
        let y1 = -this.context.canvas.height / 2 / this.zoomLevel + this.cameraY;
        let x2 = this.context.canvas.width / 2 / this.zoomLevel + this.cameraX;
        let y2 = this.context.canvas.height / 2 / this.zoomLevel + this.cameraY;
        worldData.drawTiledDataToContext(this.context, x1, y1, x2, y2);

        this.context.globalAlpha = 1.0;
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