import React from 'react';
import styles from './Toolbox.module.css';
import ToolButton from './ToolButton.js';

class Toolbox extends React.Component {
    render() {
        let tools = [
            { name: 'pan', icon: 'pan_tool' },
            { name: 'draw', icon: 'pan_tool' },
        ];
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
        return (
            <div className={styles.root}>
                <div className={styles.toolSelection}>
                    {toolButtons}
                </div>
            </div>
        );
    }
}

export default Toolbox;