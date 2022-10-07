const { contextBridge } = require("electron");
const ip = require('ip');
const { ObjectId } = require("mongodb");
const { normalizeFields } = require("./utils");

module.exports = APP => {
    contextBridge.exposeInMainWorld("api", {
        apiExample: () => {
            console.log('You just used the example API')
            return 1;
        },
        // SERVER FUNCTIONS
        getIP: ip.address,
        getIsSessionRunning: () => APP.sessionIsRunning,
        getSessionList: () => new Promise((resolve, reject) => APP.db.collection("sessions").find().toArray((err, sessions) => {
            if (err) {
                console.error(err);
                reject("Error finding patient records");
            }

            resolve(sessions.map(session => ({
                ...session,
                _id: session._id.toString(),
            })));
        })),
        startSession: async ({
            id: sessionId,
            generalFields,
            stations,
        }) => new Promise((resolve, rej) => {
            if (APP.sessionIsRunning) rej('Session already started');

            APP.sessionIsRunning = true;

            if (sessionId) APP.db.collection("sessions").findOne({
                _id: ObjectId(sessionId),
            }).then(result => {
                APP.sessionInfo = result;
            }).then(() => APP.db.collection("patients").find({
                sessionId: ObjectId(sessionId),
            }).toArray((err, patients = []) => {
                console.log({patients})
                if (err) {
                    console.error(err);
                    rej("Error finding patient records");
                }
                APP.sessionInfo = {
                    ...APP.sessionInfo,
                    records: patients,
                }
                resolve(APP.sessionInfo);
            }));

            else APP.db.collection("sessions")
                .insertOne({
                    generalFields,
                    stations,
                    createdAt: new Date(),
                }).then(result => {
                    APP.sessionInfo = {
                        // id from db
                        // sessionId: result.insertedId,
                        generalFields: normalizeFields(generalFields),
                        stations: stations.map((station, i) => ({
                            ...station,
                            fields: normalizeFields(station.fields),
                        })),
                        records: [],
                    };
                    resolve(APP.sessionInfo);
                });
        }),
        stopSession: () => {
            console.log('Stopping session...')
            if (APP.sessionIsRunning) {
                APP.sessionInfo = undefined;
                APP.sessionIsRunning = false;
                return 'Successfully stopped session';
            }
            return 'The session is already stopped';
        },
    });

    console.log('-- completed setting up context bridge --');

    return APP;
}