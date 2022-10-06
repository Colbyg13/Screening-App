const { contextBridge } = require("electron");
const ip = require('ip');
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
        getSessionList: async () => APP.db.collection("sessions").find().toArray(),
        startSession: async ({
            id: sessionId,
            generalFields,
            stations,
        }) => new Promise((res, rej) => {
            console.log('Starting session...', sessionId)
            if (!APP.sessionIsRunning) {

                if (sessionId) {
                    APP.db.collection("sessions")
                        .findOne({
                            _id: sessionId,
                        }).then(result => {
                            APP.sessionInfo = result;
                            APP.db.collection("patients").find({
                                sessionId,
                            }).toArray((err, patients = []) => {
                                if (err) {
                                    console.error(err);
                                    res.status(400).send("Error finding patient records");
                                }
                                APP.sessionInfo = {
                                    ...APP.sessionInfo,
                                    records: patients,
                                }
                            });
                        });
                }

                else APP.db.collection("sessions")
                    .insertOne({
                        generalFields,
                        stations,
                        createdAt: new Date(),
                    })
                    .then(result => {
                        console.log({ result })

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
                    });

                APP.sessionIsRunning = true;
                res('Success')
            }

            rej('Session already started');
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