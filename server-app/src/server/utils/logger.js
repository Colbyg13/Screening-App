const fs = require('fs');
const path = require('path');
const { logsPath } = require("../consts/paths")

const LOG_LEVEL = {
    INFO: 'Info',
    WARN: 'Warn',
    ERROR: 'Error',
}

const logFile = 'server.log'
const backupLogFile = 'server-backup.log'

function writeLog(logLevel, message) {

    const pathToLog = path.join(logsPath, logFile);
    const pathToBackup = path.join(logsPath, backupLogFile);

    const log = `${new Date().toLocaleString()} - ${logLevel}: ${message}\n`

    switch (logLevel) {
        case LOG_LEVEL.INFO:
            console.info(log)
            break;
        case LOG_LEVEL.WARN:
            console.warn(log)
            break;
        case LOG_LEVEL.ERROR:
            console.error(log)
            break;
        default:
            console.log(log)
            break;
    }

    if (fs.existsSync(pathToLog)) {
        const logStats = fs.statSync(pathToLog);

        console.log("Stats: ", logStats)
        if (logStats.size > 10_000_000) {
            console.log("File full. removing backup and recreating new log file...")
            if (fs.existsSync(pathToBackup)) {
                console.log("removing backup...")
                fs.rmSync(pathToBackup);
            }
            console.log("renaming file...")
            fs.renameSync(pathToLog, pathToBackup);
        }
    }

    fs.appendFile(pathToLog, log, (err) => {
        if (err) console.error("could not write error to file.", err);
    });
}

module.exports = {
    LOG_LEVEL,
    writeLog,
}