import React from 'react';
import './App.css';
import PrimaryCanvas from './widgets/PrimaryCanvas.js';
import Toolbox from './widgets/Toolbox.js';

class App extends React.Component {
  constructor(props) {
    super(props);
    // Settings for each of the tools as well as identification of the currently
    // active tool.
    let toolset = {
      active: 'pan',
      settings: {
        pan: {},
      }
    };
    this.state = {
      toolset: toolset,
    };
    this.handleToolsetChange = this.handleToolsetChange.bind(this);
  }

  handleToolsetChange(newToolset) {
    this.setState({
      toolset: newToolset
    });
  }

  render() {
    return (
      <div className="App">
        <Toolbox 
          toolset={this.state.toolset} 
          onToolsetChange={this.handleToolsetChange}
        />
        <PrimaryCanvas 
          toolset={this.state.toolset} 
          onToolsetChange={this.handleToolsetChange}
        />
      </div>
    );
  }
}

export default App;
