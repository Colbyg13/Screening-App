const { contextBridge, app, ipcRenderer } = require('electron');
const { dialog } = require('@electron/remote');
const ip = require('ip');
const { database } = require('./db');
const { writeLog, LOG_LEVEL } = require('./utils/logger');
const { default: convert, getBaseUnit } = require('../utils/convert');
const fs = require('fs');

let dbStatus = false;

contextBridge.exposeInMainWorld('api', {
    getIP: () => ip.address(undefined, 'ipv4'),
    getDBStatus: async () => {
        if (dbStatus) return dbStatus;

        try {
            await database.stats();
            dbStatus = true;
            return true;
        } catch (error) {
            console.error('Could not get database status', error);
            return false;
        }
    },
    showMessage: ({ title, message, type }) =>
        dialog.showMessageBox(null, { title, message, type }),
    writeLog: (logLevel, message) => {
        try {
            writeLog(logLevel, message);
        } catch (error) {
            console.error('Could not write logs');
        }
    },
    showSaveDialog: () => {
        const date = new Date();
        const fileName = `records-${date.toLocaleDateString()}`.replace(/\//g, '-');

        return dialog.showSaveDialogSync(null, {
            defaultPath: `/${fileName}.csv`,
            filters: [{ name: 'Spread Sheet', extensions: ['csv', 'xlsx', 'ods'] }],
        });
    },
    deleteAllRecordsAndSessions: () =>
        new Promise(async (res, rej) => {
            writeLog(LOG_LEVEL.INFO, `Deleting all Records and Sessions`);
            try {
                const collectionsToDrop = ['records', 'sessions', 'fields'];

                for (const collection of collectionsToDrop) {
                    await database.collection(collection).drop();
                    await database.createCollection(collection);
                }

                // reset the latestID
                await database
                    .collection('latestRecordID')
                    .findOneAndUpdate({}, { $set: { latestID: 1 } });

                localStorage.clear();

                res('Success');
            } catch (err) {
                writeLog(LOG_LEVEL.ERROR, `could not delete all records and sessions ${err}`);
                rej('Could not delete all records and sessions');
            }
        }),
    factoryReset: () =>
        new Promise(async (res, rej) => {
            writeLog(LOG_LEVEL.INFO, `Factory Resetting`);
            try {
                await database.dropDatabase();
                localStorage.clear();

                ipcRenderer.sendSync('reload-app');
                res('Success');
            } catch (err) {
                writeLog(LOG_LEVEL.ERROR, `could not complete a factory reset ${err}`);
                rej('Could not factory reset');
            }
        }),
    downloadRecords: (initialOutputPath, allFieldKeys = [], unitConversions = {}) =>
        new Promise((resolve, reject) => {
            writeLog(LOG_LEVEL.INFO, `Downloading Records`);

            function convertRecordFromBaseUnits(record) {
                const completeUnitConversion = {
                    ...record.customData,
                    ...unitConversions,
                };

                const convertedRecord = {};

                for (const [key, value] of Object.entries(record)) {
                    if (typeof value === 'boolean') {
                        convertedRecord[key] = value ? 'Yes' : 'No';
                        continue;
                    }

                    // check for unit conversion
                    const unit = completeUnitConversion[key];
                    if (unit) {
                        const baseUnit = getBaseUnit(unit);
                        if (baseUnit !== unit) {
                            convertedRecord[key] = convert(value).from(baseUnit).to(unit);
                            continue;
                        }
                    }

                    convertedRecord[key] = value;
                }

                return convertedRecord;
            }

            const outputPath = initialOutputPath.match(/.csv$/)
                ? initialOutputPath
                : `${initialOutputPath}.csv`;

            fs.mkdirSync(outputPath.replace(/^(.*(\/|\\)).*$/, '$1'), { recursive: true });

            const writeStream = fs.createWriteStream(outputPath, { flags: 'w' });
            const stream = database.collection('records').find().stream();

            // Creates the csv headers
            writeStream.write(
                `${allFieldKeys
                    .map(key => (unitConversions[key] ? `${key} (${unitConversions[key]})` : key))
                    .join(',')}\n`,
            );

            stream.on('data', doc => {
                const record = convertRecordFromBaseUnits(doc);
                writeStream.write(`${allFieldKeys.map(key => record[key] ?? '').join(',')}\n`);
            });
            stream.on('end', () => {
                writeLog(LOG_LEVEL.INFO, `record stream ended`);
                writeStream.end();
            });
            stream.on('error', err => {
                writeLog(
                    LOG_LEVEL.ERROR,
                    `An error occurred when trying to download the records: ${err}`,
                );
                reject('An error occurred when trying to download the records.');
            });

            writeStream.on('close', () => {
                writeLog(LOG_LEVEL.INFO, `record stream ended`);
                resolve('Download Completed');
            });

            writeStream.on('error', function (err) {
                writeLog(
                    LOG_LEVEL.ERROR,
                    `An error occurred when trying to download the records: ${err}`,
                );
                reject('An error occurred when trying to download the records.');
            });
        }),
});
