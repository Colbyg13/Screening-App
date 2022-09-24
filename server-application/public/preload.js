const { contextBridge } = require("electron");
const ip = require('ip');
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require('cors');
const { connectToDatabase, getDB } = require("./server/express-db");
const { ObjectId } = require("mongodb");

const SERVER_PORT = 3333;

const app = express();
app.use(cors());
app.use(express.json());
const server = createServer(app);
const io = new Server(server);
connectToDatabase();

let sessionIsRunning = false;
let sessionInfo;

app.get('/api/v1/server', (req, res) => {
    res.json({ name: 'Test Computer' });
});

app.get('/api/v1/patient-records', (req, res) => {
    const db = getDB();
    db.collection("patients").find().toArray((err, patients) => {
        if (err) {
            console.error(err);
            res.status(400).send("Error finding patient records");
        }
        res.status(200).json({ patients });
    });
})

app.post('/api/v1/create-record', (req, res) => {
    if (sessionIsRunning) {
        const record = req.body;
        const db = getDB();
        const newUser = {
            created_at: new Date(),
            last_modified: new Date(),
            session_id: sessionInfo.id,
            ...record,
        };

        db.collection("patients")
            .insertOne(newUser)
            .then(result => {
                const newId = result.insertedId;
                // console.log(`Added a new record with id ${newId}`);

                // update local state
                sessionInfo = {
                    ...sessionInfo,
                    records: [...sessionInfo.records, { _id: newId, ...record }]
                }

                io.emit('session-info-update', sessionInfo);

                res.json({ newId });
            })
            .catch(err => {
                console.error(err);
                res.status(400).send("Error creating patient record");
            });
    }
    else res.status(400).send("Session not started. Please start a session to create a record");
});

app.post('/api/v1/update-record', (req, res) => {
    const { _id: recordId, ...record } = req.body;
    const db = getDB();
    const patient = { last_modified: new Date(), ...record, };

    db.collection("patients")
        .findOneAndUpdate(
            { _id: ObjectId(recordId) },
            { $set: patient }
        )
        .then(result => {
            const updatedRecord = { ...result.value, ...patient };

            if (sessionIsRunning) {

                const oldRecord = sessionInfo.records.find(({ _id }) => _id === recordId);

                if (oldRecord) {
                    sessionInfo = {
                        ...sessionInfo,
                        records: replace(
                            sessionInfo.records,
                            sessionInfo.records.indexOf(oldRecord),
                            updatedRecord,
                        ),
                    }
                } else {
                    sessionInfo = {
                        ...sessionInfo,
                        records: [...sessionInfo.records, updatedRecord],
                    }
                }
                io.emit('session-info-update', sessionInfo);
            }
            res.json({ record: updatedRecord });
        })
        .catch(err => {
            console.error(err);
            res.status(400).send("Error updating patient record");
        });
})

io.on("connection", socket => {
    console.log("User Connected");

    socket.on("session connect", (data, callback) => {
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
    startSession: async ({
        sessionId,
        generalFields,
        stations,
    }) => {
        console.log('Starting session...')
        if (!sessionIsRunning) {

            if (sessionId) {
                // get the session and records and to continue the session
            }
            else {
                sessionInfo = {
                    generalFields,
                    stations,
                    records: [],
                };
            }

            sessionIsRunning = true;
            return 'Session started successfully';
        }

        throw new Error('The Session is already running');
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
