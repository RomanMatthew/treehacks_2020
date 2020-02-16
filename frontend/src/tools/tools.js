import React from 'react';
import Slider from '@material-ui/core/Slider/Slider.js';
import Switch from '@material-ui/core/Switch/Switch.js';
import FormControlLabel from '@material-ui/core/FormControlLabel/FormControlLabel.js';
import worldData from '../data/worldData.js';

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
        ctx.dataview.zoomLevel = Math.min(ctx.dataview.zoomLevel, 16.0);
        ctx.dataview.zoomLevel = Math.max(ctx.dataview.zoomLevel, 1 / 16.0);
        return true;
    },
    renderOptions: () => null,
    defaultOptions: {},
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
    renderOptions: (_, onChangeOptions) => (<div>
        <div>Max Canopy Diameter (ft)</div>
        <Slider 
            value={worldData.newTreeSize * 2}
            onChange={(_, value) => {
                worldData.newTreeSize = value / 2.0;
                worldData.newTrees.markEverythingDirty();
                onChangeOptions();
            }}
            step={0.1}
            min={1.0}
            max={30.0}
            valueLabelDisplay="auto"
        />
        <div>Default Density (%)</div>
        <Slider 
            value={worldData.newTreeDensity * 100}
            onChange={(_, value) => {
                worldData.newTreeDensity = value / 100.0;
                worldData.newTrees.markEverythingDirty();
                onChangeOptions();
            }}
            step={1.0}
            min={1.0}
            max={100.0}
            valueLabelDisplay="auto"
        />
    </div>),
    defaultOptions: {},
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

function makeBrush(options) {
    return makeSoftRadialBrush(options.radius, options.strength / 100.0, options.value / 100.0);
}

let brushDragDelta = 0;

const densityTool = {
    name: 'density',
    displayName: 'Draw Density',
    icon: 'brush',
    description: 'Draw areas to have increased/decreased density compared to '
        + 'the value set with the tree info tool. Blue areas have higher '
        + 'density (with the bluest being +100%) and red areas have lower '
        + 'density (with the reddest being -100%).',
    onClick: (ctx, x, y) => {
        brushDragDelta = 0;
        let brush = makeBrush(ctx.options);
        ctx.worldData.densityModifier.executeBrush(x, y, ctx.options.radius, brush);
        ctx.worldData.newTrees.markAreaDirty(x, y, ctx.options.radius);
        return true;
    },
    onDrag: (ctx, dx, dy, nx, ny) => {
        brushDragDelta += Math.sqrt(dx * dx + dy * dy);
        if (brushDragDelta > ctx.options.radius  / 4.0) {
            brushDragDelta = 0.0;
            let brush = makeBrush(ctx.options);
            ctx.worldData.densityModifier.executeBrush(nx, ny, ctx.options.radius, brush);
            ctx.worldData.newTrees.markAreaDirty(nx, ny, ctx.options.radius);
            return true;
        }
    },
    onScroll: () => null,
    renderOptions: (options, onChangeOptions) => (<div>
        <div>Brush Radius (ft)</div>
        <Slider 
            value={options.radius}
            onChange={(_, value) => {
                options.radius = value;
                onChangeOptions();
            }}
            step={100}
            min={100}
            max={5000}
            valueLabelDisplay="auto"
        />
        <div>Brush Strength (%)</div>
        <Slider 
            value={options.strength}
            onChange={(_, value) => {
                options.strength = value;
                onChangeOptions();
            }}
            step={1}
            min={0}
            max={100}
            valueLabelDisplay="auto"
        />
        <div>Brush Value (%)</div>
        <Slider 
            value={options.value}
            onChange={(_, value) => {
                options.value = value;
                onChangeOptions();
            }}
            step={1}
            min={-100}
            max={100}
            valueLabelDisplay="auto"
        />
    </div>),
    defaultOptions: {
        radius: 600.0,
        strength: 100.0,
        value: 100.0,
    }
};

const pictureTool = {
    name: 'picture',
    displayName: 'Capture Image',
    icon: 'camera_alt',
    description: 'Click anywhere to capture an image from any connected camera '
        + 'and process it to detect trees. The results will be placed next to '
        + 'where you clicked.',
    onClick: async (ctx, x, y) => {
        let imageData = await fetch('/api/image-data');
        for (let tree of await imageData.json()) {
            ctx.worldData.trees.addPoint(tree[0] + x, tree[1] + y, tree[2]);
        }
        ctx.worldData.newTrees.markEverythingDirty();
        return true;
    },
    onDrag: () => null,
    onScroll: () => null,
    renderOptions: () => null,
    defaultOptions: {},
};

const visibilityTool = {
    name: 'visibility',
    displayName: 'Visibility',
    icon: 'visibility',
    description: 'Toggle visibility of different data layers.',
    onClick: () => null,
    onDrag: () => null,
    onScroll: () => null,
    renderOptions: (options, onChangeOptions) => (<div>
        <FormControlLabel
            control={<Switch checked={options.drawTrees} onChange={(_, value) => {
                options.drawTrees = value;
                onChangeOptions();
            }} />}
            label="Existing Trees"
        />
        <FormControlLabel
            control={<Switch checked={options.drawNewTrees} onChange={(_, value) => {
                options.drawNewTrees = value;
                onChangeOptions();
            }} />}
            label="Generated Trees"
        />
        <FormControlLabel
            control={<Switch checked={options.drawDensityMod} onChange={(_, value) => {
                options.drawDensityMod = value;
                onChangeOptions();
            }} />}
            label="Density Tweaks"
        />
    </div>),
    defaultOptions: {
        drawTrees: true,
        drawNewTrees: true,
        drawDensityMod: true,
    },
}

let tools = [panTool, visibilityTool, infoTool, densityTool, pictureTool];
export default tools;

export let defaultToolset = {
    active: tools[0].name,
    options: {},
};
for (let tool of tools) {
    defaultToolset.options[tool.name] = tool.defaultOptions;
}


