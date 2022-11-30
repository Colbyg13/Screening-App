const { createServer } = require("http");
const { Server } = require("socket.io");

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
        console.log("User Connected", username);

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
            console.log("connect-to-station");
            socket.stationId = data.stationId;
            socket.broadcast.emit('join-station', {
                username: socket.username,
                stationId: socket.stationId,
            })
        });

        socket.on("disconnect-from-station", (data, callback) => {
            console.log("disconnect-from-station");
            socket.stationId = undefined;
            socket.broadcast.emit('leave-station', {
                username: socket.username,
            })
        });

        socket.on('disconnect', () => {
            console.log("disconnect");
            socket.emit('user-disconnect', {
                username: socket.username,
            })
        })

        socket.broadcast.emit('user-connected', {
            username: socket.username
        })
    });

    return APP;
}