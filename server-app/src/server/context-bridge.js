const { contextBridge } = require("electron");
const { dialog } = require("@electron/remote");
const ip = require('ip');
const { ObjectId } = require("mongodb");
const { normalizeFields } = require("./utils");
const fs = require('fs');
const convert = require('convert-units');


module.exports = APP => {
    contextBridge.exposeInMainWorld("api", {
        apiExample: () => {
            console.log('You just used the example API')
            return 1;
        },
        // SERVER FUNCTIONS
        getIP: ip.address,
        showMessage: ({ title, message, type }) => dialog.showMessageBox(null, { title, message, type }),
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
        getIsSessionRunning: () => APP.sessionIsRunning,
        getRecordCount: () => APP.db.collection("patients").countDocuments(),
        getRecords: (search = '', sort = {}, skip = 0, pageSize = 50, unitConversions = {}) => new Promise((resolve, reject) => APP.db.collection("patients")
            .find(search ? {
                $or: ['id', 'name'].map(key => ({
                    $expr: {
                        $regexMatch: {
                            input: { "$toString": `$${key}` },
                            regex: new RegExp(search, 'i'),
                        }
                    }
                })),
            } : {}).sort(sort).limit(pageSize).skip(skip).toArray((err, patients) => {
                if (err) {
                    console.error(err);
                    reject("Error finding patient records");
                }

                const convertedPatients = patients.map(({ customData, ...record }) => ({
                    ...record,
                    ...Object.entries(unitConversions).reduce((all, [key, unit]) => ({
                        ...all,
                        [key]: record[key] === undefined ?
                            undefined
                            :
                            convert(record[key]).from(customData[key]).to(unit),
                    }), {})
                }));

                console.log({
                    convertedPatients,
                    patients,
                    unitConversions,
                })
                resolve(convertedPatients);
            })),
        createRecord: record => new Promise((resolve, reject) => {
            if (APP.sessionIsRunning) {
                APP.db.collection('latestRecordID')
                    .findOneAndUpdate(
                        {},
                        { $inc: { "latestID": 1 } },
                    )
                    .then(({ value: { latestID } = {} } = {}) => {

                        const generalInfo = APP.sessionInfo.generalFields.reduce((all, { key, value }) => ({
                            ...all,
                            [key]: value,
                        }), {});

                        const newUser = {
                            id: latestID,
                            createdAt: new Date(),
                            lastModified: new Date(),
                            sessionId: APP.sessionInfo._id,
                            ...generalInfo,
                            ...record,
                        };

                        APP.db.collection("patients")
                            .insertOne(newUser)
                            .then(result => {

                                const newUserWithId = {
                                    _id: result.insertedId,
                                    ...newUser,
                                };

                                APP.io.sockets.emit('record-created', newUserWithId);

                                APP.sessionRecords = [...APP.sessionRecords, newUserWithId];

                                resolve({ newId: latestID });
                            })
                    })
                    .catch(err => {
                        console.error(err);
                        reject("Error creating patient record");
                    });
            }
            else reject("Session not started. Please start a session to create a record");
        }),
        updateRecord: ({ record, customData = {} }) => new Promise((resolve, reject) => APP.db.collection("patients")
            .findOneAndUpdate(
                { id: record.id },
                {
                    $set: {
                        lastModified: new Date(),
                        ...record,
                        // only updates the fields the record is tied to
                        ...Object.entries(customData).reduce((all, [key, value]) => ({
                            ...all,
                            [`customData.${key}`]: value,
                        }), {}),
                    }
                },
                { returnDocument: 'after' }
            )
            .then(({ value: updatedRecord }) => {

                if (APP.sessionIsRunning) {
                    const oldRecord = APP.sessionRecords.find(({ id }) => id === record.id);
                    if (oldRecord) APP.sessionRecords = replace(APP.sessionRecords, APP.sessionRecords.indexOf(oldRecord), updatedRecord);
                    APP.io.sockets.emit('record-updated', updatedRecord);
                }

                resolve({ record: updatedRecord });
            })
            .catch(err => {
                console.error(err);
                reject("Error updating patient record");
            })
        ),
        downloadRecords: (initialOutputPath, allFieldKeys = [], unitConversions = {}) => new Promise((resolve, reject) => {

            const outputPath = initialOutputPath.match(/.csv$/) ?
                initialOutputPath
                :
                `${initialOutputPath}.csv}`;

            fs.mkdirSync(outputPath.replace(/^(.*(\/|\\)).*$/, '$1'), { recursive: true });

            const writeStream = fs.createWriteStream(outputPath, { flags: 'w' });
            const stream = APP.db.collection('patients').find().stream();

            writeStream.write(`${allFieldKeys.map(key => unitConversions[key] ? `${key} (${unitConversions[key]})` : key).join(',')}\n`);

            stream.on('data', doc => {
                writeStream.write(`${allFieldKeys.map(key => doc[key] === undefined ?
                    ''
                    :
                    unitConversions[key] ?
                        convert(doc[key]).from(doc.customData[key]).to(unitConversions[key])
                        :
                        doc[key]).join(',')}\n`)
            });
            stream.on('end', () => {
                console.log('record stream ended');
                writeStream.end();
            });
            stream.on('error', err => {
                console.error(err);
                reject('An error occurred when trying to download the records.');
            });

            writeStream.on('close', () => {
                console.log('Close');
                resolve('Download Completed');
            });

            writeStream.on('error', function (err) {
                console.log(err);
                reject('An error occurred when trying to download the records.');
            });
        }),
        getFields: () => new Promise((resolve, reject) => APP.db.collection("fields")
            .find().toArray((err, fields) => {
                if (err) {
                    console.error(err);
                    reject("Error finding patient records");
                }
                resolve(fields);
            })),
        getSessionList: () => new Promise((resolve, reject) => APP.db.collection("sessions")
            .find().toArray((err, sessions) => {
                if (err) {
                    console.error(err);
                    reject("Error finding sessions");
                }

                resolve(sessions.map(session => ({
                    ...session,
                    _id: session._id.toString(),
                })));
            })),
        getCustomDataTypes: () => new Promise((resolve, reject) => APP.db.collection("customDataTypes")
            .find().toArray((err, customDataTypes) => {
                if (err) {
                    console.error(err);
                    reject("Error finding custom data types");
                }

                resolve(customDataTypes.map(dataType => ({
                    ...dataType,
                    _id: dataType._id.toString(),
                })));
            })),
        saveCustomDataTypes: ({
            customDataTypes,
            dataTypeIdsToDelete,
        }) => APP.db.collection("customDataTypes").bulkWrite([
            ...customDataTypes.map(({ _id = new ObjectId().toString(), ...dataType }) => ({
                updateOne: {
                    filter: { _id: new ObjectId(_id) },
                    upsert: true,
                    update: {
                        $set: dataType,
                    }
                }
            })),
            ...dataTypeIdsToDelete.map(_id => ({
                deleteOne: {
                    filter: { _id: new ObjectId(_id) },
                }
            }))
        ]),
        startSession: async ({
            id: sessionId,
            generalFields,
            stations,
        }) => new Promise((resolve, rej) => {
            if (APP.sessionIsRunning) rej('Session already started');

            const normalizedGeneralFields = normalizeFields(generalFields);
            const normalizedStations = stations.map((station, i) => ({
                id: i + 1,
                ...station,
                fields: normalizeFields(station.fields),
            }));

            if (sessionId) APP.db.collection("sessions")
                .findOne({ _id: ObjectId(sessionId) })
                .then(sessionInfo => {
                    APP.sessionInfo = sessionInfo;
                })
                .then(() => APP.db.collection("patients")
                    .find({ sessionId: ObjectId(sessionId) })
                    .toArray((err, sessionRecords = []) => {

                        if (err) {
                            console.error(err);
                            rej("Error finding patient records");
                        }

                        APP.sessionRecords = sessionRecords;
                        APP.sessionIsRunning = true;

                        APP.io.sockets.emit('session-started');

                        resolve({
                            sessionInfo: APP.sessionInfo,
                            sessionRecords: APP.sessionRecords,
                        });

                    }));
            else APP.db.collection("sessions")
                .insertOne({
                    generalFields: normalizedGeneralFields,
                    stations: normalizedStations,
                    createdAt: new Date(),
                }).then(result => {

                    APP.sessionInfo = {
                        _id: result.insertedId,
                        generalFields: normalizedGeneralFields,
                        stations: normalizedStations,
                    };

                    APP.sessionRecords = [];
                    APP.sessionIsRunning = true;
                }).then(() => {

                    // keep track of all the fields for our records view
                    const allFields = [
                        ...normalizedGeneralFields,
                        ...normalizedStations.reduce((all, { fields = [] }) => [
                            ...all,
                            ...fields,
                        ], []),
                    ]

                    APP.db.collection("fields").bulkWrite(allFields.map(field => ({
                        updateOne: {
                            filter: { key: field.key },
                            upsert: true,
                            update: {
                                $set: field,
                            }
                        }
                    })));

                    APP.io.sockets.emit('session-started');

                    resolve({
                        sessionInfo: APP.sessionInfo,
                        sessionRecords: APP.sessionRecords,
                    });
                });
        }),
        stopSession: () => {
            console.log('Stopping session...')
            if (APP.sessionIsRunning) {
                APP.sessionInfo = undefined;
                APP.sessionRecords = undefined;
                APP.sessionIsRunning = false;
                APP.io.sockets.emit('session-ended');
                return 'Successfully stopped session';
            }
            return 'The session is already stopped';
        },
    });

    console.log('-- completed setting up context bridge --');

    return APP;
}

function replace(arr, i, val) {
    if (
        (parseInt(i) !== i)
        ||
        (i < 0)
    ) {
        console.error(arguments);
        throw new TypeError(`replace() index must be a positive integer, received ${i}`);
    }
    const newArr = arr.slice();
    newArr[i] = val;
    return newArr;
};