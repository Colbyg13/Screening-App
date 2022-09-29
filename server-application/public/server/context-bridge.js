const { contextBridge } = require("electron");
const ip = require('ip');
const { normalizeFields } = require("./utils");
const axios = require('axios');
const { ObjectId } = require("mongodb");

module.exports = APP => {
    contextBridge.exposeInMainWorld("api", {
        apiExample: () => {
            console.log('You just used the example API')
            return 1;
        },
        // SERVER FUNCTIONS
        getIP: ip.address,
        getIsSessionRunning: () => APP.sessionIsRunning,
        startSession: async ({
            sessionId,
            generalFields,
            stations,
        }) => new Promise((res, rej) => {
            console.log('Starting session...')
            if (!APP.sessionIsRunning) {

                if (sessionId) APP.db.collection("sessions")
                    .findOne({
                        id: ObjectId(sessionId),
                    }).then(result => {
                        APP.sessionInfo = result;
                    });

                else APP.db.collection("sessions")
                    .insertOne({
                        generalFields,
                        stations,
                        createdAt: new Date(),
                    })
                    .then(result => {

                        APP.sessionInfo = {
                            // id from db
                            sessionId: result.insertedId,
                            generalFields: normalizeFields(generalFields),
                            stations: stations.map((station, i) => ({
                                ...station,
                                id: i + 1,
                                fields: normalizeFields(station.fields),
                            })),
                            records: [],
                        };
                    });

                APP.sessionIsRunning = true;
                res.send('Success')
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