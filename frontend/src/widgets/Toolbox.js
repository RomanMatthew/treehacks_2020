import React from 'react';
import styles from './Toolbox.module.css';
import ToolButton from './ToolButton.js';
import Slider from '@material-ui/core/Slider/Slider.js';

class Toolbox extends React.Component {
    render() {
        let tools = [
            { name: 'pan', displayName: 'Pan/Zoom', icon: 'pan_tool', description: '' },
            { name: 'info', displayName: 'Tree Info', icon: 'info', description: '' },
        ];
        tools[0].description = 'Click and drag to pan the view, and scroll in and out to zoom.';
        tools[1].description = 'Enter information about the trees that will be planted. This ';
        tools[1].description += 'information will be used by the algorithm to place new trees.';
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
        let toolOptions = null;
        if (activeTool.name === 'info') {
            toolOptions = (<div className={styles.toolOptions}>
                <div>Max Canopy Diameter (ft)</div>
                <Slider 
                    defaultValue={10.0}
                    step={0.1}
                    min={1.0}
                    max={30.0}
                    valueLabelDisplay="auto"
                />
                <div>Default Density (%)</div>
                <Slider 
                    defaultValue={100.0}
                    step={1.0}
                    min={1.0}
                    max={100.0}
                    valueLabelDisplay="auto"
                />
            </div>);
        }
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
                {toolOptions}
            </div>
        );
    }
}

export default Toolbox;