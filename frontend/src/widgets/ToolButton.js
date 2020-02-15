import React from 'react';
import styles from './ToolButton.module.css';
import Icon from '@material-ui/core/Icon/Icon.js';

class Toolbox extends React.Component {
    render() {
        return (
            <div className={styles.aspectRatioParent}>
                <div className={styles.aspectRatioChild}>
                    <Icon className={styles.icon}>{this.props.iconName}</Icon>
                </div>
            </div>
        );
    }
}

export default Toolbox;