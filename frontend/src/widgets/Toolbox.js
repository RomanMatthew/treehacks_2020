import React from 'react';
import styles from './Toolbox.module.css';
import PanToolIcon from '@material-ui/icons/PanTool';

class Toolbox extends React.Component {
    render() {
        return (
            <div className={styles.root}><PanToolIcon fontSize='inherit' /></div>
        );
    }
}

export default Toolbox;