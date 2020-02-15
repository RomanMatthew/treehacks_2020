import React from 'react';
import styles from './ToolButton.module.css';
import Icon from '@material-ui/core/Icon/Icon.js';

class Toolbox extends React.Component {
    render() {
        let rootClasses = styles.aspectRatioParent;
        if (this.props.active) {
            rootClasses += ' ' + styles.active;
        }
        return (
            <div className={rootClasses} onClick={() => this.props.onClick()}>
                <div className={styles.aspectRatioChild}>
                    <Icon className={styles.icon}>{this.props.iconName}</Icon>
                </div>
            </div>
        );
    }
}

export default Toolbox;