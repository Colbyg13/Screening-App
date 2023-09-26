const { removeEmptyValues } = require("./utils/index.js");
const { LOG_LEVEL, writeLog } = require("./utils/logger");

module.exports = APP => {

    // SERVER
    APP.get('/api/v1/server', (req, res) => {
        res.json({ name: 'Test Computer' });
    });

    APP.get('/api/v1/sessions/current', (req, res) => {
        if (!APP.sessionInfo) {
            writeLog(LOG_LEVEL.ERROR, `No session started`);
            res.status(400).send("No session started");
        }


        APP.db.collection("patients").find({
            sessionId: APP.sessionInfo._id,
        }).toArray((err, sessionRecords) => {
            if (err) {
                writeLog(LOG_LEVEL.ERROR, `Error finding session records, ${err}`);
                res.status(400).send("Error finding session records");
            }
            res.status(200).json({
                sessionInfo: APP.sessionInfo,
                sessionRecords,
            });
        });
    });

    // CUSTOM DATA TYPES
    APP.get('/api/v1/custom-data-types', (req, res) => APP.db.collection("customDataTypes")
        .find().toArray((err, customDataTypes) => {
            if (err) {
                writeLog(LOG_LEVEL.ERROR, `Error finding custom data types, ${err}`);
                res.status(400).send("Error finding custom data types");
            }
            res.status(200).json(customDataTypes);
        }));

    // PATIENT RECORDS
    APP.get('/api/v1/patients', (req, res) => APP.db.collection("patients")
        .find().toArray((err, patients) => {
            if (err) {
                writeLog(LOG_LEVEL.ERROR, `Error finding patient records, ${err}`);
                res.status(400).send("Error finding patient records");
            }
            res.status(200).json({ patients });
        }));

    APP.post('/api/v1/patients/create', (req, res) => {
        const {
            record,
            customData = {},
        } = req.body;

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
                        ...removeEmptyValues(record),
                        customData,
                    };

                    APP.db.collection("patients")
                        .insertOne(newUser)
                        .then(result => {

                            // console.log({ result })

                            const newUserWithId = {
                                _id: result.insertedId,
                                ...newUser,
                            };

                            // console.log('Emitting record-created', newUserWithId);
                            APP.io.sockets.emit('record-created', newUserWithId);

                            res.json({ newId: latestID });
                        })
                })
                .catch(err => {
                    writeLog(LOG_LEVEL.ERROR, `Error finding patient record, ${err}`)
                    res.status(400).send("Error creating patient record");
                });
        }
        else {
            writeLog(LOG_LEVEL.ERROR, `Session not started. Please start a session to create a record`)
            res.status(400).send("Session not started. Please start a session to create a record");
        }
    });

    APP.post('/api/v1/patients/update', (req, res) => {
        const {
            record,
            customData = {},
        } = req.body;

        APP.db.collection("patients")
            .findOneAndUpdate(
                { id: record.id },
                {
                    $set: {
                        lastModified: new Date(),
                        ...removeEmptyValues(record),
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
                    APP.io.sockets.emit('record-updated', updatedRecord);
                }

                if (!updatedRecord) {
                    writeLog(LOG_LEVEL.ERROR, `Unable to update record`)
                    res.status(400).send('Unable to update record');
                }

                res.json({ record: updatedRecord });
            })
            .catch(err => {
                writeLog(LOG_LEVEL.ERROR, `Error updating patient record, ${err}`)
                res.status(400).send("Error updating patient record");
            });
    });

    writeLog(LOG_LEVEL.INFO, '-- completed setting up routes --');

    return APP;
};