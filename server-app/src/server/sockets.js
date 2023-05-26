const { createServer } = require("http");
const { Server } = require("socket.io");
const { LOG_LEVEL, writeLog } = require("./utils/logger");

module.exports = APP => {
    APP.server = createServer(APP);
    APP.io = new Server(APP.server, {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"]
        },
    });

    APP.io.on("connection", socket => {
        const username = socket.handshake.auth.username;
        const isAdmin = socket.handshake.auth.isAdmin;

        writeLog(LOG_LEVEL.INFO, `User connected: ${username} ${isAdmin ? '(Admin)' : ''}`);

        socket.username = username;
        socket.isAdmin = isAdmin;

        if (socket.isAdmin) {
            // Took from socket.io docs: https://socket.io/get-started/private-messaging-part-1/
            const users = [];

            for (let [id, socket] of APP.io.of("/").sockets) {
                if (!socket.isAdmin) users.push({
                    userID: id,
                    username: socket.username,
                    stationId: socket.stationId,
                });
            }
            socket.emit("users", users);
        }

        socket.on("connect-to-station", (data, callback) => {
            socket.stationId = data.stationId;
            writeLog(LOG_LEVEL.INFO, `Connect to station: ${socket.username}-${socket.stationId}`)
            socket.broadcast.emit('join-station', {
                username: socket.username,
                stationId: socket.stationId,
            })
        });

        socket.on("disconnect-from-station", (data, callback) => {
            writeLog(LOG_LEVEL.INFO, `Disconnect from station: ${socket.username}-${socket.stationId}`)
            socket.stationId = undefined;
            socket.broadcast.emit('leave-station', {
                username: socket.username,
            })
        });

        socket.on('disconnect', () => {
            writeLog(LOG_LEVEL.INFO, `Leaving: ${socket.username}-${socket.stationId}`)
            socket.emit('user-disconnect', {
                username: socket.username,
            })
        })

        writeLog(LOG_LEVEL.INFO, `Connected: ${socket.username}`)
        socket.broadcast.emit('user-connected', {
            username: socket.username
        })
    });

    return APP;
}