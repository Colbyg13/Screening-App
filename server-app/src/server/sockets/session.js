const { LOG_LEVEL, writeLog } = require('../utils/logger');
const { getOrCreateUser } = require('../database/utils/users');
const { createNewSession } = require('../database/utils/sessions');
const { upsertMultipleFields } = require('../database/utils/fields');

const SERVER_COMPUTER_DEVICE_ID = 'ServerComputer';

let sessionState = {
    sessionIsRunning: false,
    sessionId: null,
};

let sessionUsers = [];

module.exports = io => {
    io.on('connection', async socket => {
        const deviceId = socket.handshake.auth.deviceId;
        const isServerComputer = deviceId === SERVER_COMPUTER_DEVICE_ID;
        let userId = '';
        let username = '';

        if (isServerComputer) {
            userId = -1;
            username = 'Server Computer';
        } else {
            try {
                const user = await getOrCreateUser(deviceId);

                userId = user?.userId;
                username = user?.username;
            } catch (error) {
                writeLog(LOG_LEVEL.ERROR, `Error getting username from device ID: ${deviceId}`);
                return;
            }
        }

        writeLog(LOG_LEVEL.INFO, `Session Connect: ${username}`);

        sessionUsers.push({
            userId,
            username,
        });

        // to everyone on the socket
        io.emit('user-connected', {
            userId,
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
                    const newSession = await createNewSession({ generalFields, stations });

                    sessionState = {
                        sessionIsRunning: true,
                        sessionId: newSession._id,
                    };

                    console.log({});

                    // use the newSession variable here because it's fields have been normalized already
                    const allFields = [
                        ...newSession.generalFields,
                        ...newSession.stations.reduce(
                            (all, { fields = [] }) => [...all, ...fields],
                            [],
                        ),
                    ];

                    await upsertMultipleFields({ fields: allFields });

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
            writeLog(LOG_LEVEL.INFO, `Station Join: ${username} - ${socket.stationId}`);
            io.emit('station-join', {
                userId,
                username,
                stationId: socket.stationId,
            });
        });

        socket.on('station-leave', (data, callback) => {
            writeLog(LOG_LEVEL.INFO, `Station Leave: ${username} - ${socket.stationId}`);
            socket.stationId = undefined;
            io.emit('station-leave', {
                userId,
                username,
            });
        });

        socket.on('disconnect', () => {
            writeLog(LOG_LEVEL.INFO, `Session Disconnect: ${username} - ${socket.stationId}`);
            io.emit('user-disconnect', {
                userId,
                username,
            });
            sessionUsers = sessionUsers.filter(user => user.userId !== userId);
        });
    });
};
