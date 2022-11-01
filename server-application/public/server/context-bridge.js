const { contextBridge } = require("electron");
const ip = require('ip');
const { ObjectId } = require("mongodb");
const { normalizeFields } = require("./utils");

module.exports = APP => {
    contextBridge.exposeInMainWorld("api", {
        apiExample: () => {
            console.log('You just used the example API')
            return 1;
        },
        // SERVER FUNCTIONS
        getIP: ip.address,
        getIsSessionRunning: () => APP.sessionIsRunning,
        getRecords: (search = '', sort = {}, skip = 0, pageSize = 50, allFieldKeys = []) => new Promise((resolve, reject) => APP.db.collection("patients")
            .find(search ? {
                $or: allFieldKeys.map(key => ({
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
                resolve(patients);
            })),
        updateRecord: record => new Promise((resolve, reject) => APP.db.collection("patients")
            .findOneAndUpdate(
                { id: record.id },
                { $set: { lastModified: new Date(), ...record, eyes: undefined } },
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