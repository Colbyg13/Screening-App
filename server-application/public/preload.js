const { contextBridge } = require("electron");
const ip = require('ip');
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const SERVER_PORT = 3333;

const app = express();
const server = createServer(app);
const io = new Server(server, {
    // allowRequest: (req, callback) => {
    //     const noOriginHeader = req.headers.origin === undefined;
    //     callback(null, noOriginHeader); // only allow requests without 'origin' header
    // },
});

let sessionIsRunning = false;
let sessionInfo;

app.get('/server', (req, res) => {
    res.json({ name: 'Test Computer' });
});

io.on("connection", socket => {
    console.log("USER CONNECTED");

    socket.on("session connect", getSessionInfo => {
        console.log("User connecting to station...")
        getSessionInfo(sessionInfo);
    })

})

contextBridge.exposeInMainWorld("api", {
    apiExample: () => {
        console.log('You just used the example API')
        return 1;
    },
    // SERVER FUNCTIONS
    getIP: ip.address,
    getIsSessionRunning: () => sessionIsRunning,
    startSession: (generalFields, stations) => new Promise((res, rej) => {
        console.log('STARTING SESSION')
        if (!sessionIsRunning) {
            io.disconnectSockets();

            sessionInfo = {
                generalFields,
                stations,
                // TODO: get from DB
                records: [],
            };

            sessionIsRunning = true;
            res('Session started successfully.')
        }
        else rej('The Session is already running.')
    }),
    stopSession: () => new Promise((res, rej) => {
        console.log('STOPPING SESSION')
        if (sessionIsRunning) {
            io.disconnectSockets();
            sessionInfo = undefined;
            sessionIsRunning = false;
            res('Successfully stopped session')
        }
        else rej('The session is already stopped')
    }),
});

server.listen(SERVER_PORT, () => {
    console.log(`listening on *:${SERVER_PORT}`);
})
