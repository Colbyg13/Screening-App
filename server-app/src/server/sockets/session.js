const { LOG_LEVEL, writeLog } = require('../utils/logger');
const { database } = require('../database/db');
const { normalizeFields } = require('../utils/index');
const { createNewUser, getUser } = require('../database/utils/users');

const SERVER_COMPUTER_DEVICE_ID = 'ServerComputer';

let sessionState = {
    sessionIsRunning: false,
    sessionId: null,
};

let sessionUsers = [];

module.exports = io => {
    io.on('connection', async socket => {
        const deviceID = socket.handshake.auth.deviceID;
        const isServerComputer = deviceID === SERVER_COMPUTER_DEVICE_ID;
        let userID = '';
        let username = '';

        if (isServerComputer) {
            userID = -1;
            username = 'Server Computer';
        } else {
            try {
                const user = await getUser(deviceID);
                if (user) {
                    userID = user?.userID;
                    username = user?.username;
                } else {
                    const newUser = await createNewUser(deviceID);
                    userID = newUser?.userID;
                    username = newUser?.username;
                }
            } catch (error) {
                writeLog(LOG_LEVEL.ERROR, `Error getting username from device ID: ${deviceID}`);
                return;
            }
        }

        writeLog(LOG_LEVEL.INFO, `Session Connect: ${username}`);

        sessionUsers.push({
            userID,
            username,
        });

        // to everyone on the socket
        io.emit('user-connected', {
            userID,
            username,
        });

        // socket specific
        socket.emit('users', sessionUsers);
        socket.emit('session-info', {
            ...sessionState,
            initial: true,
        });

        /**
         * SOCKET EVENT HANDLERS
         */
        socket.on('session-start', async (data, callback) => {
            writeLog(LOG_LEVEL.INFO, `Session start: ${username}-${JSON.stringify(data)}`);
            if (!isServerComputer) return;

            const { sessionId, generalFields, stations } = data;

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
                        ...normalizedStations.reduce(
                            (all, { fields = [] }) => [...all, ...fields],
                            [],
                        ),
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
                            },
                        },
                    }));

                    const fieldCol = database.collection('fields');
                    await fieldCol.bulkWrite(bulkPayload);

                    io.emit('session-info', sessionState);
                } catch (error) {
                    writeLog(LOG_LEVEL.ERROR, `Error creating new session ${error}`);
                }
            }
        });

        socket.on('session-stop', (data, callback) => {
            writeLog(LOG_LEVEL.INFO, `Session stop: ${username}`);
            if (!isServerComputer) return;

            sessionState = {
                sessionIsRunning: false,
                sessionId: null,
            };
            io.emit('session-info', sessionState);
        });

        socket.on('station-join', (data, callback) => {
            socket.stationId = data.stationId;
            writeLog(LOG_LEVEL.INFO, `Station Join: ${username}-${socket.stationId}`);
            io.emit('station-join', {
                userID,
                username,
                stationId: socket.stationId,
            });
        });

        socket.on('station-leave', (data, callback) => {
            writeLog(LOG_LEVEL.INFO, `Station Leave: ${username}-${socket.stationId}`);
            socket.stationId = undefined;
            io.emit('station-leave', {
                userID,
                username,
            });
        });

        socket.on('disconnect', () => {
            writeLog(LOG_LEVEL.INFO, `Station Disconnect: ${username}-${socket.stationId}`);
            io.emit('user-disconnect', {
                userID,
                username,
            });
            sessionUsers = sessionUsers.filter(user => user.userID !== userID);
        });
    });
};
