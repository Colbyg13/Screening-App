const { LOG_LEVEL, writeLog } = require("../utils/logger");
const { database } = require('../db');
const { normalizeFields } = require("../utils/index");

let sessionState = {
    sessionIsRunning: false,
    sessionId: null,
}

module.exports = (io) => {
    io.on('connection', (socket) => {
        const username = socket.handshake.auth.username;
        const isAdmin = socket.handshake.auth.isAdmin;

        writeLog(LOG_LEVEL.INFO, `Session Connect: ${username}  ${isAdmin ? '(Admin)' : ''}`);

        socket.on("session-start", async (data, callback) => {
            writeLog(LOG_LEVEL.INFO, `Session start: ${username}${isAdmin ? ' (Admin)' : ''}-${JSON.stringify(data)}`);
            if (!isAdmin) return;

            const {
                sessionId,
                generalFields,
                stations,
            } = data;

            if (data.sessionId) {
                sessionState = {
                    sessionIsRunning: true,
                    sessionId: sessionId,
                };
                io.emit('session-info', sessionState);
            } else {
                try {

                    const normalizedGeneralFields = normalizeFields(generalFields);
                    const normalizedStations = stations.map((station, i) => ({
                        id: i + 1,
                        ...station,
                        fields: normalizeFields(station.fields),
                    }));
                    const sessionsCol = database.collection('sessions');
                    const result = await sessionsCol.insertOne({
                        generalFields: normalizedGeneralFields,
                        stations: normalizedStations,
                        createdAt: new Date(),
                    });

                    sessionState = {
                        sessionIsRunning: true,
                        sessionId: result.insertedId,
                    };

                    // Update the fields in db so we have everything
                    const allFields = [
                        ...normalizedGeneralFields,
                        ...normalizedStations.reduce((all, { fields = [] }) => [
                            ...all,
                            ...fields,
                        ], []),
                    ];

                    const bulkPayload = allFields.map(field => ({
                        updateOne: {
                            filter: { key: field.key },
                            upsert: true,
                            update: {
                                $set: {
                                    key: field.key,
                                    name: field.name ?? field.key,
                                    type: field.type,
                                },
                            }
                        }
                    }));

                    const fieldCol = database.collection("fields")
                    await fieldCol.bulkWrite(bulkPayload);

                    io.emit('session-info', sessionState);

                } catch (error) {
                    writeLog(LOG_LEVEL.ERROR, `Error creating new session ${error}`);
                }
            }
        });

        socket.on("session-stop", (data, callback) => {
            writeLog(LOG_LEVEL.INFO, `Session stop: ${username}${isAdmin ? ' (Admin)' : ''}`);
            if (!isAdmin) return;

            sessionState = {
                sessionIsRunning: false,
                sessionId: null,
            };
            io.emit('session-info', sessionState);
        });

        socket.on("station-join", (data, callback) => {
            socket.stationId = data.stationId;
            writeLog(LOG_LEVEL.INFO, `Station Join: ${username}-${socket.stationId}`);
            io.emit('station-join', {
                username: username,
                stationId: socket.stationId,
            });
        });

        socket.on("station-leave", (data, callback) => {
            writeLog(LOG_LEVEL.INFO, `Station Leave: ${username}-${socket.stationId}`);
            socket.stationId = undefined;
            io.emit('station-leave', {
                username: username,
            });
        });

        socket.on('disconnect', () => {
            writeLog(LOG_LEVEL.INFO, `Station Disconnect: ${username}-${socket.stationId}`);
            io.emit('user-disconnect', {
                username: username,
            });
        });

        io.emit('user-connected', {
            username: username
        });

        const users = [];

        for (let [id, socket] of io.of("/").sockets) {
            if (!isAdmin) users.push({
                userID: id,
                username: username,
                stationId: socket.stationId,
            });
        }

        socket.emit("users", users);
        socket.emit("session-info", sessionState);
    });
};