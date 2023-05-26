const express = require("express");
const cors = require('cors');
const { LOG_LEVEL, writeLog } = require("./utils/logger");

module.exports = APP => {

    APP.use(cors());

    APP.use(express.json());

    writeLog(LOG_LEVEL.INFO, '-- completed middlewares --');

    return APP;
}