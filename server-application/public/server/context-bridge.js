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
        getCustomDataTypes: () => new Promise((resolve, reject) => APP.db.collection("customDataTypes").find().toArray((err, customDataTypes) => {
            if (err) {
                console.error(err);
                reject("Error finding patient records");
            }

            resolve(customDataTypes.map(dataType => ({
                ...dataType,
                _id: dataType._id.toString(),
            })));
        })),
        saveCustomDataTypes: ({
            customDataTypes,
            dataTypeIdsToDelete,
        }) => APP.db.collection("customDataTypes").bulkWrite([
            ...customDataTypes.map(({ _id = new ObjectId().toString(), ...dataType }) => ({
                updateOne: {
                    filter: { _id: new ObjectId(_id) },
                    upsert: true,
                    update: {
                        $set: dataType,
                    }
                }
            })),
            ...dataTypeIdsToDelete.map(_id => ({
                deleteOne: {
                    filter: { _id: new ObjectId(_id) },
                }
            }))
        ]),
        startSession: async ({
            id: sessionId,
            generalFields,
            stations,
        }) => new Promise((resolve, rej) => {
            if (APP.sessionIsRunning) rej('Session already started');

            console.log({ stations, generalFields, sessionId })

            APP.sessionIsRunning = true;

            if (sessionId) APP.db.collection("sessions")
                .findOne({ _id: ObjectId(sessionId) })
                .then(sessionInfo => {
                    APP.sessionInfo = sessionInfo;
                })
                .then(() => APP.db.collection("patients")
                    .find({ sessionId: ObjectId(sessionId) })
                    .toArray((err, sessionRecords = []) => {
                        console.log({ sessionRecords })

                        if (err) {
                            console.error(err);
                            rej("Error finding patient records");
                        }

                        APP.sessionRecords = sessionRecords;

                        resolve({
                            sessionInfo: APP.sessionInfo,
                            sessionRecords: APP.sessionRecords,
                        });

                    }));
            else APP.db.collection("sessions")
                .insertOne({
                    generalFields,
                    stations,
                    createdAt: new Date(),
                }).then(result => {

                    APP.sessionInfo = {
                        _id: result.insertedId,
                        generalFields: normalizeFields(generalFields),
                        stations: stations.map((station, i) => ({
                            ...station,
                            fields: normalizeFields(station.fields),
                        })),
                    };

                    APP.sessionRecords = [];

                    resolve({
                        sessionInfo: APP.sessionInfo,
                        sessionRecords: APP.sessionRecords,
                    });
                });
        }),
        stopSession: () => {
            console.log('Stopping session...')
            if (APP.sessionIsRunning) {
                APP.sessionInfo = undefined;
                APP.sessionRecords = undefined;
                APP.sessionIsRunning = false;
                return 'Successfully stopped session';
            }
            return 'The session is already stopped';
        },
    });

    console.log('-- completed setting up context bridge --');

    return APP;
}