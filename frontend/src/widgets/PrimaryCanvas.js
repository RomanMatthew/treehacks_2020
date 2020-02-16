import React from 'react';
import styles from './PrimaryCanvas.module.css';
import worldData from '../data/worldData.js';
import tools from '../tools/tools.js';

class PrimaryCanvas extends React.Component {
    constructor(props) {
        super(props);
        this.canvasRef = React.createRef();

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
            options: this.props.toolset.options[this._getActiveTool().name],
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

    drawCanvas() {
        this.context = this.canvasRef.current.getContext('2d');
        this.clearCanvas();
        let x1 = this.inverseTransformX(0);
        let y1 = this.inverseTransformY(0);
        let x2 = this.inverseTransformX(this.context.canvas.width);
        let y2 = this.inverseTransformY(this.context.canvas.height);

        this.context.globalAlpha = 0.7;
        worldData.drawTiledDataToContext(this.context, x1, y1, x2, y2);
        this.context.globalAlpha = 1.0;
        worldData.trees.drawToContext(this.context, x1, y1, x2, y2);
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