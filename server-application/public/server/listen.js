const SERVER_PORT = 3333;

module.exports = APP => {
    APP.server.listen(SERVER_PORT, () => {
        console.log(`listening on *:${SERVER_PORT}`);
    });

    return APP;
}