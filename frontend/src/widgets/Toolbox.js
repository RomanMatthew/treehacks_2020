import React from 'react';
import styles from './Toolbox.module.css';
import ToolButton from './ToolButton.js';

class Toolbox extends React.Component {
    render() {
        return (
            <div className={styles.root}>
                <div className={styles.toolSelection}>
                    <ToolButton iconName="pan_tool" />
                    <ToolButton iconName="pan_tool" />
                    <ToolButton iconName="pan_tool" />
                    <ToolButton iconName="pan_tool" />
                    <ToolButton iconName="pan_tool" />
                    <ToolButton iconName="pan_tool" />
                </div>
            </div>
        );
    }
}

export default Toolbox;