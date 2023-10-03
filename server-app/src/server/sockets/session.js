const { LOG_LEVEL, writeLog } = require("../utils/logger");
const { database } = require('../db');

const sessionState = {
    isSessionRunning: false,
    sessionId: null,
}

module.exports = (io) => {
    io.on('connection', (socket) => {
        writeLog(LOG_LEVEL.INFO, `Session Connect: ${socket.username}  ${isAdmin ? '(Admin)' : ''}`);

        const username = socket.handshake.auth.username;
        const isAdmin = socket.handshake.auth.isAdmin;

        socket.username = username;
        socket.isAdmin = isAdmin;

        socket.on("session-start", async (data, callback) => {
            if (!socket.isAdmin) return;
            if (sessionState.isSessionRunning) return;

            writeLog(LOG_LEVEL.INFO, `Session start: ${socket.username}-${JSON.stringify(data)}`);

            const {
                sessionId,
                generalFields,
                stations,
            } = data;

            if (data.sessionId) {
                sessionState = {
                    isSessionRunning: true,
                    sessionId: sessionId,
                };
                socket.broadcast.emit('session-info', sessionState);
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
                        isSessionRunning: true,
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
                                $set: field,
                            }
                        }
                    }));

                    const fieldCol = database.collection("fields")
                    await fieldCol.bulkWrite(bulkPayload);

                    socket.broadcast.emit('session-info', sessionState);

                } catch (error) {
                    writeLog(LOG_LEVEL.ERROR, `Error updating session ${error}`);
                }
            }
        });

        socket.on("session-stop", (data, callback) => {
            if (socket.isAdmin && !sessionState.isSessionRunning) {
                writeLog(LOG_LEVEL.INFO, `Session stop: ${socket.username}-${data.sessionId}`);
                sessionState = {
                    isSessionRunning: false,
                    sessionId: null,
                };
                socket.broadcast.emit('session-info', sessionState);
            }
        });

        socket.emit("session", sessionState);
    });
};