const { ObjectId } = require("mongodb");

module.exports = APP => {

    // SERVER
    APP.get('/api/v1/server', (req, res) => {
        res.json({ name: 'Test Computer' });
    });

    APP.get('/api/v1/sessions/current', (req, res) => {
        console.log({ sessionInfo: APP.sessionInfo })
        res.json(APP.sessionInfo);
    })

    // APP.get('/api/v1/sessions', (req, res) => {
    //     APP.db.collection("sessions").find().toArray((err, patients) => {
    //         if (err) {
    //             console.error(err);
    //             res.status(400).send("Error finding sessions");
    //         }
    //         res.status(200).json({ patients });
    //     });
    // })

    // APP.get('/api/v1/sessions/:sessionId', (req, res) => {
    //     const sessionId = req.params.sessionId;
    //     APP.db.collection("sessions").findOne(
    //         { _id: ObjectId(sessionId) }
    //     ).then(result => {
    //         if (result) res.json(result);

    //         res.status(400).send("Error finding session");
    //     })
    //         .catch(err => {
    //             console.error(err);
    //             res.status(400).send("Error finding session");
    //         })
    // })

    // PATIENT RECORDS
    APP.get('/api/v1/patients', (req, res) => {
        APP.db.collection("patients").find().toArray((err, patients) => {
            if (err) {
                console.error(err);
                res.status(400).send("Error finding patient records");
            }
            res.status(200).json({ patients });
        });
    })

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
                        sessionId: APP.sessionInfo.sessionId,
                        ...generalInfo,
                        ...record,
                    };
                    console.log('session ID', newUser.sessionId, typeof (newUser.sessionId));

                    APP.db.collection("patients")
                        .insertOne(newUser)
                        .then(result => {
                            // update local state
                            APP.sessionInfo = {
                                ...APP.sessionInfo,
                                records: [...APP.sessionInfo.records, { _id: result.insertedId, ...newUser }]
                            }

                            APP.io.sockets.emit('session-info-update', APP.sessionInfo);

                            // io.sockets.emit('session-info-update', sessionInfo);

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

                    const oldRecord = APP.sessionInfo.records.find(({ id }) => id === updatedRecord.id);

                    if (oldRecord) {
                        APP.sessionInfo = {
                            ...APP.sessionInfo,
                            records: replace(
                                APP.sessionInfo.records,
                                APP.sessionInfo.records.indexOf(oldRecord),
                                updatedRecord,
                            ),
                        }
                    } else {
                        APP.sessionInfo = {
                            ...APP.sessionInfo,
                            records: [...APP.sessionInfo.records, updatedRecord],
                        }
                    }

                    APP.io.sockets.emit('session-info-update', APP.sessionInfo);
                }
                res.json({ record: updatedRecord });
            })
            .catch(err => {
                console.error(err);
                res.status(400).send("Error updating patient record");
            });
    });

    console.log('-- completed seeing up routes --');

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