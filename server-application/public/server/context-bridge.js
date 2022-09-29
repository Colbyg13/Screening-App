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
        startSession: async ({
            sessionId,
            generalFields,
            stations,
        }) => {
            console.log('Starting session...')
            if (!APP.sessionIsRunning) {

                if (sessionId) {
                    //TODO: get the session and records and to continue the session
                }
                else {
                    // COLBY WILL DO THIS
                    //TODO: Create a session in the DB and use that information
                    console.log('creatingSession');
                    const result = await APP.db.collection("sessions")
                        .insertOne({ generalFields, stations })

                    APP.sessionInfo = {
                        // id from db
                        sessionId: result.insertedId,
                        generalFields: normalizeFields(generalFields),
                        stations: stations.map(station => ({
                            ...station,
                            fields: normalizeFields(station.fields),
                        })),
                        records: [],
                    };
                    console.log({ sessionInfo: APP.sessionInfo })
                }

                APP.sessionIsRunning = true;
                return 'Session started successfully';
            }

            throw new Error('The Session is already running');
        },
        stopSession: () => {
            console.log('Stopping session...')
            if (APP.sessionIsRunning) {
                APP.sessionInfo = undefined;
                APP.sessionIsRunning = false;
                return 'Successfully stopped session';
            }
            else throw new Error('The session is already stopped');
        },
    });

    console.log('-- completed setting up context bridge --');

    return APP;
}