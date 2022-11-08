
module.exports = APP => {

    // SERVER
    APP.get('/api/v1/server', (req, res) => {
        res.json({ name: 'Test Computer' });
    });

    APP.get('/api/v1/sessions/current', (req, res) => res.json({
        sessionInfo: APP.sessionInfo,
        sessionRecords: APP.sessionRecords,
    }));

    // CUSTOM DATA TYPES
    APP.get('/api/v1/custom-data-types', (req, res) => APP.db.collection("customDataTypes")
        .find().toArray((err, customDataTypes) => {
            if (err) {
                console.error(err);
                res.status(400).send("Error finding patient records");
            }
            res.status(200).json(customDataTypes);
        }));

    // PATIENT RECORDS
    APP.get('/api/v1/patients', (req, res) => APP.db.collection("patients")
        .find().toArray((err, patients) => {
            if (err) {
                console.error(err);
                res.status(400).send("Error finding patient records");
            }
            res.status(200).json({ patients });
        }));

    APP.post('/api/v1/patients/create', (req, res) => {
        if (APP.sessionIsRunning) {
            const record = req.body;
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

                            // console.log({ result })

                            const newUserWithId = {
                                _id: result.insertedId,
                                ...newUser,
                            };

                            // console.log('Emitting record-created', newUserWithId);
                            APP.io.sockets.emit('record-created', newUserWithId);

                            APP.sessionRecords = [...APP.sessionRecords, newUserWithId];

                            res.json({ newId: latestID });
                        })
                })
                .catch(err => {
                    console.error(err);
                    res.status(400).send("Error creating patient record");
                });
        }
        else res.status(400).send("Session not started. Please start a session to create a record");
    });

    APP.post('/api/v1/patients/update', (req, res) => {
        const record = req.body;

        APP.db.collection("patients")
            .findOneAndUpdate(
                { id: record.id },
                { $set: { lastModified: new Date(), ...record, } },
                { returnDocument: 'after' }
            )
            .then(({ value: updatedRecord }) => {

                if (APP.sessionIsRunning) {
                    const oldRecord = APP.sessionRecords.find(({ id }) => id === record.id);
                    if (oldRecord) {
                        APP.sessionRecords = replace(APP.sessionRecords, APP.sessionRecords.indexOf(oldRecord), updatedRecord);
                        APP.io.sockets.emit('record-updated', updatedRecord);
                    }
                }

                res.json({ record: updatedRecord });
            })
            .catch(err => {
                console.error(err);
                res.status(400).send("Error updating patient record");
            });
    });

    console.log('-- completed setting up routes --');

    return APP;
};

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