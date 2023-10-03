const { contextBridge } = require("electron");
const { dialog } = require("@electron/remote");
const ip = require('ip');
const { database } = require('./db');
const { writeLog, LOG_LEVEL } = require("./utils/logger");

let dbStatus = false;

contextBridge.exposeInMainWorld("api", {
    getIP: () => ip.address(undefined, "ipv4"),
    getDBStatus: async () => {
        if (dbStatus) return dbStatus;

        try {
            await database.stats();
            dbStatus = true;
            return true;
        } catch (error) {
            console.error("Could not get database status", error)
            return false;
        }
    },
    showMessage: ({ title, message, type }) => dialog.showMessageBox(null, { title, message, type }),
    writeLog: (logLevel, message) => {
        try {
            writeLog(logLevel, message);
        } catch (error) {
            console.error("Could not write logs");
        }
    },
    showSaveDialog: () => {
        const date = new Date();
        const fileName = `records-${date.toLocaleDateString()}`.replace(/\//g, '-');

        return dialog.showSaveDialogSync(null, {
            defaultPath: `/${fileName}.csv`,
            filters: [
                { name: 'Spread Sheet', extensions: ['csv', 'xlsx', 'ods'] },
            ]
        });
    },
    deleteAllRecordsAndSessions: () => new Promise(async (res, rej) => {
        try {
            await database.collection("patients").drop();
            await database.collection("sessions").drop();
            await database.collection("fields").drop();
            await database.collection('latestRecordID').findOneAndUpdate(
                {},
                { $set: { "latestID": 1 } },
            );

            res('Success');
        } catch (error) {
            rej('Could not delete all records and sessions');
        }
    }),
    downloadRecords: (initialOutputPath, allFieldKeys = [], unitConversions = {}) => new Promise((resolve, reject) => {
        const outputPath = initialOutputPath.match(/.csv$/) ?
            initialOutputPath
            :
            `${initialOutputPath}.csv`;

        fs.mkdirSync(outputPath.replace(/^(.*(\/|\\)).*$/, '$1'), { recursive: true });

        const writeStream = fs.createWriteStream(outputPath, { flags: 'w' });
        const stream = database.collection('patients').find().stream();

        writeStream.write(`${allFieldKeys.map(key => unitConversions[key] ? `${key} (${unitConversions[key]})` : key).join(',')}\n`);

        stream.on('data', doc => {
            writeStream.write(`${allFieldKeys.map(key => doc[key] === undefined ?
                ''
                :
                unitConversions[key] ?
                    convert(+doc[key]).from(doc.customData[key] || unitConversions[key]).to(unitConversions[key])
                    :
                    doc[key]).join(',')}\n`)
        });
        stream.on('end', () => {
            console.log('record stream ended');
            writeLog(LOG_LEVEL.INFO, `record stream ended`);
            writeStream.end();
        });
        stream.on('error', err => {
            writeLog(LOG_LEVEL.ERROR, `An error occurred when trying to download the records: ${err}`);
            reject('An error occurred when trying to download the records.');
        });

        writeStream.on('close', () => {
            writeLog(LOG_LEVEL.INFO, `record stream ended`);
            resolve('Download Completed');
        });

        writeStream.on('error', function (err) {
            writeLog(LOG_LEVEL.ERROR, `An error occurred when trying to download the records: ${err}`);
            reject('An error occurred when trying to download the records.');
        });
    }),
});
