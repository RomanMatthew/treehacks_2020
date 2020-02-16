import React from 'react';
import styles from './Toolbox.module.css';
import ToolButton from './ToolButton.js';
import tools from '../tools/tools.js';

class Toolbox extends React.Component {
    render() {
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
        let activeOptions = this.props.toolset.options[activeTool.name];
        let onChangeOptions = () => this.props.onToolsetChange(this.props.toolset);
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
                <div className={styles.toolOptions}>
                    {activeTool.renderOptions(activeOptions, onChangeOptions)}
                </div>
            </div>
        );
    }
}

export default Toolbox;