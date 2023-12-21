const fs = require('fs');
const path = require('path');
const { ipcRenderer } = require('electron');

const LOG_LEVEL = {
    INFO: 'Info',
    WARN: 'Warn',
    ERROR: 'Error',
};

const logFile = 'server.log';
const backupLogFile = 'server-backup.log';

let logsPath = '';
let applicationPath = '';

async function writeLog(logLevel, message) {
    if (!applicationPath || !logsPath) {
        await setPaths();
    }

    const pathToLog = path.join(logsPath, logFile);
    const pathToBackup = path.join(logsPath, backupLogFile);

    const log = `${new Date().toLocaleString()} - ${logLevel}: ${message}\n`;

    switch (logLevel) {
        case LOG_LEVEL.INFO:
            console.log(log);
            break;
        case LOG_LEVEL.WARN:
            console.warn(log);
            break;
        case LOG_LEVEL.ERROR:
            console.error(log);
            break;
        default:
            console.log(log);
            break;
    }

    if (fs.existsSync(pathToLog)) {
        const logStats = fs.statSync(pathToLog);

        if (logStats.size > 10_000_000) {
            console.log('File full. removing backup and recreating new log file...');
            if (fs.existsSync(pathToBackup)) {
                console.log('removing backup...');
                fs.rmSync(pathToBackup);
            }
            console.log('renaming file...');
            fs.renameSync(pathToLog, pathToBackup);
        }
    }

    fs.appendFile(pathToLog, log, err => {
        if (err) console.error('could not write error to file.', err);
    });
}

async function setup() {
    if (!applicationPath || !logsPath) {
        await setPaths();
    }
    // sets up file system
    // ROOT
    console.log('Checking application exists', applicationPath);
    if (!fs.existsSync(applicationPath)) {
        console.log('Making App dir...');
        fs.mkdirSync(applicationPath);
    }
    // LOGS
    console.log('Checking application Logs exists', logsPath);
    if (!fs.existsSync(logsPath)) {
        console.log('Making Logs dir...');
        fs.mkdirSync(logsPath);
    }
}

async function getLogsPath() {
    if (!applicationPath || !logsPath) {
        await setPaths();
    }

    return logsPath;
}

async function setPaths() {
    try {
        const appDataPath = await ipcRenderer.invoke('get-path');
        const applicationName = 'HealthySamoa';
        applicationPath = path.join(appDataPath, applicationName);
        logsPath = path.join(applicationPath, 'logs');
    } catch (error) {
        console.error('Error setting logs path:', error);
    }
}

module.exports = {
    LOG_LEVEL,
    writeLog,
    setup,
    getLogsPath,
};
