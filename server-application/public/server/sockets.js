const { createServer } = require("http");
const { Server } = require("socket.io");

module.exports = APP => {
    APP.server = createServer(APP);
    APP.io = new Server(APP.server);

    APP.io.on("connection", socket => {
        console.log("User Connected");

        //TODO: move to endpoints (unless we need the socket instance?)
        socket.on("connect-to-session", (data, callback) => {
            if (APP.sessionIsRunning) {
                console.log("User connecting to station...", data);
                // TODO: keep track of who is at which station
                callback(APP.sessionInfo);
            }
            else callback();
        });

        socket.on("disconnect-from-session", (data, callback) => {
            // TODO: remove user from station
        });
    });

    return APP;
}