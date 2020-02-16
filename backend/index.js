#!/usr/bin/env node

const express = require('express');
const app = express();
require('express-ws')(app);

app.use(express.json());

let wsConnections = [];
app.ws('/command-stream', (ws, req) => {
    wsConnections.push(ws);
});

let resolveImageData = null;
app.post('/api/image-data', (req, res) => {
    if (!resolveImageData) {
        res.status(400).send('lol go away no one wants your data.');
        return;
    }
    console.log(req.body);
    resolveImageData(req.body);
    resolveImageData = null;
});
app.get('/api/image-data', async (req, res) => {
    let imageDataPromise = new Promise((resolve, _) => {
        resolveImageData = resolve;
    });
    for (let connection of wsConnections) {
        try {
            connection.send('take_picture');
        } catch { }
    }
    let imageData = await imageDataPromise;
    res.status(200).send(imageData);
});

app.use(express.static('../frontend/build/'));

console.log('Setup complete!');
app.listen(8000);
