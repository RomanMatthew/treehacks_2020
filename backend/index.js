#!/usr/bin/env node

const express = require('express');
const app = express();
const expressWs = require('express-ws')(app);

app.ws('/command-stream', (ws, req) => {
    console.log('Websocket connected!');
    ws.send('take_picture');
});

app.use(express.static('../frontend/build/'));

console.log('Setup complete!');
app.listen(8000);
