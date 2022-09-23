const { contextBridge } = require("electron");
const ip = require('ip');
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require('cors');

const SERVER_PORT = 3333;


const app = express();
app.use(cors());
app.use(express.json());
const server = createServer(app);
const io = new Server(server);

let sessionIsRunning = false;
let sessionInfo;

app.get('/api/v1/server', (req, res) => {
    res.json({ name: 'Test Computer' });
});

app.post('/api/v1/update-record', (req, res) => {

    console.log('Updating Record', req.body)

    const {
        body: record,
    } = req;

    if (sessionIsRunning) {
        console.log('UPDATING RECORD...', record)
        const {
            records = []
        } = sessionInfo;

        const oldRecord = records.find(({ id }) => id === record);

        // TODO: update to save in DB 

        if (oldRecord) {
            sessionInfo = {
                ...sessionInfo,
                records: replace(records, records.indexOf(oldRecord), { ...oldRecord, ...record })
            }
        }

        const newId = Math.floor(Math.random() * 99999);

        sessionInfo = {
            ...sessionInfo,
            records: [...records, { id: newId, ...record }]
        }

        console.log('Sending session-info-update', sessionInfo)

        io.emit('session-info-update', sessionInfo)

        res.status(201).json({ newId });
    }
})

io.on("connection", socket => {
    console.log("USER CONNECTED");

    socket.on("session connect", callback => {
        if (sessionIsRunning) {
            console.log("User connecting to station...")
            callback(sessionInfo);
        }
        else callback();
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
    startSession: (generalFields, stations) => {
        console.log('STARTING SESSION')
        if (!sessionIsRunning) {

            sessionInfo = {
                generalFields,
                stations,
                // TODO: get from DB
                records: [],
            };

            sessionIsRunning = true;
            return 'Session started successfully.';
        }

        throw new Error('The Session is already running.');
    },
    stopSession: () => {
        console.log('STOPPING SESSION')
        if (sessionIsRunning) {
            sessionInfo = undefined;
            sessionIsRunning = false;
            return 'Successfully stopped session';
        }
        else throw new Error('The session is already stopped');
    },
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
