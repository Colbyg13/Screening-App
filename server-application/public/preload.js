const { contextBridge } = require("electron");
const ip = require('ip');
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
var cors = require('cors');


const SERVER_PORT = 3333;

const app = express();
app.use(cors())
const server = createServer(app);
const io = new Server(server, {
    // allowRequest: (req, callback) => {
    //     const noOriginHeader = req.headers.origin === undefined;
    //     callback(null, noOriginHeader); // only allow requests without 'origin' header
    // },
});

let sessionIsRunning = false;
let sessionInfo;

app.get('/', (req, res) => {
    console.log(`We've been hit!`)
    res.json({ name: 'Test Computer' });
});

io.on("connection", socket => {
    console.log("USER CONNECTED");

    socket.on("session connect", getSessionInfo => {
        console.log("User connecting to station...")
        getSessionInfo(sessionInfo);
    })

    socket.on('update-record', recordUpdate => {
        console.log('UPDATING RECORD...', recordUpdate)
        const {
            records = []
        } = sessionInfo;

        const oldRecord = records.find(({ id }) => id === recordUpdate);

        // TODO: update to save in DB 

        if (oldRecord) {
            sessionInfo = {
                ...sessionInfo,
                records: replace(records, records.indexOf(oldRecord), { ...oldRecord, ...recordUpdate })
            }
        }

        const newId = Math.floor(Math.random() * 99999);

        sessionInfo = {
            ...sessionInfo,
            records: [...records, { id: newId, ...recordUpdate }]
        }

        // getId(recordUpdate.id || newId);

        console.log('Sending session-info-update', sessionInfo)

        socket.emit('session-info-update', sessionInfo)
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

function replace(arr, i, val) {
    if (
        (parseInt(i) !== i)
        ||
        (i < 0)
    ) {
        console.error(arguments);
        throw new TypeError(`replace() index must be a positive integer, received ${i}`);
    }
    const newArr = arr.slice();
    newArr[i] = val;
    return newArr;
};
