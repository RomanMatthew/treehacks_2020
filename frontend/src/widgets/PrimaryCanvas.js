import React from 'react';
import styles from './PrimaryCanvas.module.css';

class PrimaryCanvas extends React.Component {
    render() {
        return (
            <div className={styles.container} id="canvas-container">
                <canvas className={styles.canvas} id='primary-canvas'></canvas>
            </div>
        );
    }
}

export default PrimaryCanvas;