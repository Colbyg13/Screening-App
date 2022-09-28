const { ObjectId } = require("mongodb");

module.exports = APP => {

    // SERVER
    APP.get('/api/v1/server', (req, res) => {
        res.json({ name: 'Test Computer' });
    });

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

                    const newUser = {
                        id: latestID,
                        created_at: new Date(),
                        last_modified: new Date(),
                        session_id: APP.sessionInfo.id,
                        ...record,
                    };

                    APP.db.collection("patients")
                        .insertOne(newUser)
                        .then(result => {
                            // update local state
                            APP.sessionInfo = {
                                ...APP.sessionInfo,
                                records: [...APP.sessionInfo.records, { _id: result.insertedId, ...newUser }]
                            }

                            req.app.set('sessionInfo', APP.sessionInfo);

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
        const { _id: recordId, ...record } = req.body;
        const patient = { last_modified: new Date(), ...record, };

        APP.db.collection("patients")
            .findOneAndUpdate(
                { _id: ObjectId(recordId) },
                { $set: patient },
                { returnNewDocument: true }
            )
            .then(updatedRecord => {

                if (APP.sessionIsRunning) {

                    const oldRecord = APP.sessionInfo.records.find(({ _id }) => _id === recordId);

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

                    req.app.set('sessionInfo', APP.sessionInfo);

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