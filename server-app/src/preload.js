const express = require('express');
const { asyncPipe } = require('./server/utils');
const { setup } = require('./server/setup');
const { LOG_LEVEL, writeLog } = require("./server/utils/logger");
const unhandled = require('electron-unhandled');



console.log('-- starting up server --')

setup();

unhandled({
    logger: error => {
        writeLog(LOG_LEVEL.ERROR, `Uncaught Exception: ${error}`)
    },
    showDialog: true,
    reportButton: false,
});

asyncPipe(
    express(), // APP
    require('./server/middlewares'),
    require('./server/sockets'),
    require('./server/db-connect'),
    require('./server/routes'),
    require('./server/listen'),
    require('./server/context-bridge'),
    require('./server/error'),
);
