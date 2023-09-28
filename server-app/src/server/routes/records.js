const express = require('express');
const router = express.Router();
const { client } = require('../db');
const { LOG_LEVEL, writeLog } = require("../utils/logger");
const { io } = require('../../preload');

router.get('/', async (req, res) => {
    writeLog(LOG_LEVEL.INFO, `getting records`);
    try {
        const db = client.db();

        const recordCol = db.collection('records');
        const records = await recordCol.find().toArray();

        res.status(200).json(records);
    } catch (error) {
        writeLog(LOG_LEVEL.ERROR, `Error getting records ${error}`);
        res.status(500).json({ error: 'Could not get records due to Internal Server Error' });
    }
});

router.post('/', async (req, res) => {
    writeLog(LOG_LEVEL.INFO, `updating records: ${JSON.stringify(req.body)}`);

    const {
        record,
        sessionId,
        // need this separate if offline more or other reasons
        customData,
    } = req.body;

    const creatingRecord = !record.id;

    if (creatingRecord) {
        try {
            const db = client.db();

            const latestIDCol = db.collection('latestRecordID');
            const updatedRecordID = await latestIDCol.findOneAndUpdate({}, { $inc: { "latestID": 1 } });

            const sessionCol = db.collection('sessions');
            const sessionData = await sessionCol.findOne({ _id: sessionId });

            const generalInfo = sessionData.generalFields.reduce((all, { key, value }) => ({
                ...all,
                [key]: value,
            }), {});

            const newRecord = {
                id: updatedRecordID.value.latestID,
                createdAt: new Date(),
                lastModified: new Date(),
                sessionId,
                customData,
                ...generalInfo,
                ...removeEmptyValues(record),
            };

            const recordsCol = db.collection("records");
            const result = recordsCol.insertOne(newRecord);

            const newRecordWithId = {
                _id: result.insertedId,
                ...newRecord,
            };

            io.sockets.emit('record-created', newRecordWithId);

            res.status(200).json({ record: newRecordWithId });
        } catch (error) {
            writeLog(LOG_LEVEL.ERROR, `Error creating record ${error}`);
            res.status(500).json({ error: 'Could not update record due to Internal Server Error' });
        }
    } else {
        try {
            const db = client.db();

            const recordsCol = db.collection("records");
            const result = await recordsCol.findOneAndUpdate(
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
            );

            const updatedRecord = result.value;

            io.sockets.emit('record-updated', updatedRecord);

            res.status(200).json({ record: updatedRecord });
        } catch (error) {
            writeLog(LOG_LEVEL.ERROR, `Error creating record ${error}`);
            res.status(500).json({ error: 'Could not update record due to Internal Server Error' });
        }
    }
});



module.exports = router;