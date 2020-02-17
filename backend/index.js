#!/usr/bin/env node

const express = require('express');
const app = express();
require('express-ws')(app);
const fileUpload = require('express-fileupload');

app.use(express.json());
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));

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
    res.status(201).send();
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

let lastImagePath = null;
app.post('/api/image', (req, res) => {
    if (!req.files || !req.files.image) {
        req.status(400).send('no image no illage pillage your village wa');
    }
    lastImagePath = req.files.image.tempFilePath;
    res.status(201).send('yay :)');
});
app.get('/api/image', (req, res) => {
    res.sendFile(lastImagePath, { headers: { 'Content-Type': 'image/jpeg' } });
});

app.use(express.static('../frontend/build/'));

console.log('Setup complete!');
app.listen(8000);
