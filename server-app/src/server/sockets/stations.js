const { LOG_LEVEL, writeLog } = require("../utils/logger");

module.exports = (io) => {
    io.on('connection', (socket) => {
        writeLog(LOG_LEVEL.INFO, `Station Connect: ${socket.username}  ${isAdmin ? '(Admin)' : ''}`);

        const username = socket.handshake.auth.username;
        const isAdmin = socket.handshake.auth.isAdmin;

        socket.username = username;
        socket.isAdmin = isAdmin;

        socket.on("station-join", (data, callback) => {
            socket.stationId = data.stationId;
            writeLog(LOG_LEVEL.INFO, `Station Join: ${socket.username}-${socket.stationId}`);
            socket.broadcast.emit('join-station', {
                username: socket.username,
                stationId: socket.stationId,
            });
        });

        socket.on("station-leave", (data, callback) => {
            writeLog(LOG_LEVEL.INFO, `Station Leave: ${socket.username}-${socket.stationId}`);
            socket.stationId = undefined;
            socket.broadcast.emit('leave-station', {
                username: socket.username,
            });
        });

        socket.on('disconnect', () => {
            writeLog(LOG_LEVEL.INFO, `Station Disconnect: ${socket.username}-${socket.stationId}`);
            socket.broadcast.emit('user-disconnect', {
                username: socket.username,
            });
        });

        socket.broadcast.emit('user-connected', {
            username: socket.username
        });

        const users = [];

        for (let [id, socket] of io.of("/").sockets) {
            if (!socket.isAdmin) users.push({
                userID: id,
                username: socket.username,
                stationId: socket.stationId,
            });
        }
        socket.emit("users", users);
    });
};