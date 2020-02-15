import React from 'react';
import './App.css';
import PrimaryCanvas from './widgets/PrimaryCanvas.js';
import Toolbox from './widgets/Toolbox.js';

function App() {
  return (
    <div className="App">
      <Toolbox />
      <PrimaryCanvas />
    </div>
  );
}

export default App;
