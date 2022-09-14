const { contextBridge } = require("electron");
const ip = require('ip');
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const SERVER_PORT = 3333;

let serverIsRunning = false;

app.get('/', (req, res) => {
    res.json({ name: 'Test Computer' });
});

contextBridge.exposeInMainWorld("api", {
    apiExample: () => {
        console.log('You just used the example API')
        return 1;
    },
    // SERVER FUNCTIONS
    getIP: ip.address,
    getIsServerRunning: () => serverIsRunning,
    startServer: (generalFields, stations, sessionRecords, createOrUpdateRecord) => new Promise((res, rej) => {
        if (!serverIsRunning) {

            io.on('connection', socket => {
                console.log('a user connected');
                socket.send({ generalFields, stations, sessionRecords })
                socket.on('update-record', record => {
                    createOrUpdateRecord(record)
                    console.log('message: ' + record);
                });
                socket.on('disconnect', () => {
                    console.log('user disconnected');
                });
            });

            try {
                server.listen(SERVER_PORT, () => {
                    console.log(`listening on *:${SERVER_PORT}`);
                    serverIsRunning = true;
                    res('Server started successfully.')
                })
            } catch (e) {
                console.error(e)
                rej(e)
            }
        }
        else rej('The server is already running.')
    }),
    stopServer: () => new Promise((res, rej) => {
        if (serverIsRunning) {
            server.close();
            serverIsRunning = false;
            res('Successfully stopped server')
        }
        else rej('The server is already stopped')
    }),
});
