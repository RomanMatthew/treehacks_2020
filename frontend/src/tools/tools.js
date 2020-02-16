import React from 'react';
import Slider from '@material-ui/core/Slider/Slider.js';

const panTool = {
    name: 'pan',
    displayName: 'Pan/Zoom',
    icon: 'pan_tool',
    description: 'Click and drag to pan the view, and scroll in and out to '
        + 'zoom.',
    onClick: () => null,
    onDrag: (ctx, dx, dy) => {
        ctx.dataview.cameraX -= dx;
        ctx.dataview.cameraY -= dy;
        return true;
    },
    onScroll: (ctx, ds) => {
        ctx.dataview.zoomLevel *= Math.pow(2.0, ds * -0.1);
        return true;
    },
    renderOptions: () => null,
};

const infoTool = {
    name: 'info',
    displayName: 'Tree Info',
    icon: 'info',
    description: 'Enter information about the trees that will be planted. '
        + 'This information will be used by the algorithm to help determine '
        + 'where to place new trees.',
    onClick: () => null,
    onDrag: () => null,
    onScroll: () => null,
    renderOptions: () => (<div>
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
    </div>)
};

function makeSoftRadialBrush(brushRadius, brushStrength, brushValue) {
    return (dx, dy, oldValue) => {
        let pixelRadius = Math.sqrt(dx * dx + dy * dy);
        let pixelStrength = (brushRadius - pixelRadius) / brushRadius;
        if (pixelStrength <= 0) return oldValue;
        let totalStrength = pixelStrength * brushStrength;
        return oldValue * (1.0 - totalStrength) + brushValue * totalStrength;
    }
}

let brushDragDelta = 0;

const densityTool = {
    name: 'density',
    displayName: 'Draw Density',
    icon: 'brush',
    description: 'Draw areas to have increased/decreased density compared to '
        + 'the value set with the tree info tool.',
    onClick: (ctx, x, y) => {
        brushDragDelta = 0;
        let brush = makeSoftRadialBrush(200, 1.0, 1.0);
        ctx.worldData.densityModifier.executeBrush(x, y, 200, brush);
        return true;
    },
    onDrag: (ctx, dx, dy, nx, ny) => {
        brushDragDelta += Math.sqrt(dx * dx + dy * dy);
        if (brushDragDelta > 50.0) {
            brushDragDelta = 0.0;
            let brush = makeSoftRadialBrush(200, 1.0, 1.0);
            ctx.worldData.densityModifier.executeBrush(nx, ny, 200, brush);
            return true;
        }
    },
    onScroll: () => null,
    renderOptions: () => null,
};

export default [panTool, infoTool, densityTool];

