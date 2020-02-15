import React from 'react';
import styles from './Toolbox.module.css';
import ToolButton from './ToolButton.js';

class Toolbox extends React.Component {
    render() {
        let tools = [
            { name: 'pan', displayName: 'Pan/Zoom', icon: 'pan_tool', description: '' },
            { name: 'info', displayName: 'Tree Info', icon: 'info', description: '' },
        ];
        tools[0].description = 'Click and drag to pan the view, and scroll in and out to zoom.';
        tools[1].description = 'Enter information about the trees that will be planted. ';
        tools[1].description += 'This information will be used by the algorithm to place new trees.';
        let toolButtons = tools.map(tool => (
            <ToolButton 
                key={tool.name}
                onClick={() => {
                    let toolset = this.props.toolset;
                    toolset.active = tool.name;
                    this.props.onToolsetChange(toolset);
                }}
                active={tool.name === this.props.toolset.active}
                iconName={tool.icon}
            />
        ));
        let activeTool = tools.find(tool => tool.name === this.props.toolset.active);
        return (
            <div className={styles.root}>
                <div className={styles.toolSelection}>
                    {toolButtons}
                </div>
                <div className={styles.toolName}>
                    {activeTool.displayName}
                </div>
                <div className={styles.toolDescription}>
                    {activeTool.description}
                </div>
            </div>
        );
    }
}

export default Toolbox;