const express = require('express');
const router = express.Router();
const { database } = require('../db');
const { LOG_LEVEL, writeLog } = require("../utils/logger");
const { io } = require('../../preload');

router.get('/', async (req, res) => {
    writeLog(LOG_LEVEL.INFO, `getting records, ${JSON.stringify(req.query)}`);

    const {
        query: {
            count = false,
            find: queryFind,
            search = '',
            sort = {},
            skip = 0,
            pageSize = Infinity,
            unitConversions = {},
        } = {},
    } = req;

    // handle the case where we just want the count
    if (count) {
        try {
            const recordsCol = database.collection('records');
            const recordCount = await recordsCol.count({});

            res.status(200).json(recordCount);
        } catch (error) {
            writeLog(LOG_LEVEL.ERROR, `Error getting session templates ${error}`);
            res.status(500).json({ error: 'Could not get session templates due to Internal Server Error' });
        }
    }

    const find = queryFind ?
        JSON.parse(queryFind)
        :
        search ? {
            $or: ['id', 'name'].map(key => ({
                $expr: {
                    $regexMatch: {
                        input: { "$toString": `$${key}` },
                        regex: new RegExp(search, 'i'),
                    }
                }
            })),
        } : {};

    try {

        const recordCol = database.collection('records');
        const records = await recordCol.find(find)
            .sort(sort)
            .limit(pageSize)
            .skip(skip)
            .toArray();

        const convertedRecords = records.map(({ customData, ...record }) => ({
            ...record,
            ...Object.entries(unitConversions).reduce((all, [key, unit]) => {
                if (record[key] === undefined) return all;

                try {
                    const convertedValue = convert(+record[key]).from(customData[key] || unit).to(unit);
                    return {
                        ...all,
                        [key]: convertedValue,
                    }
                } catch (err) {
                    writeLog(LOG_LEVEL.ERROR, `Could not convert ${record[key]} from ${customData[key]} to ${unit}: ${err}`);
                    return all;
                }
            }, {})
        }));

        res.status(200).json(convertedRecords);
    } catch (error) {
        writeLog(LOG_LEVEL.ERROR, `Error getting records ${error}`);
        res.status(500).json({ error: 'Could not get records due to Internal Server Error' });
    }
});

router.get('/:recordId', async (req, res) => {
    writeLog(LOG_LEVEL.INFO, `getting record, ${req.params.recordId}`);

    const recordId = req.params.recordId;

    try {

        const recordCol = database.collection('records');
        const record = await recordCol.findOne({ _id: recordId });

        res.status(200).json(record);
    } catch (error) {
        writeLog(LOG_LEVEL.ERROR, `Error getting record ${error}`);
        res.status(500).json({ error: 'Could not get record due to Internal Server Error' });
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

            const latestIDCol = database.collection('latestRecordID');
            const updatedRecordID = await latestIDCol.findOneAndUpdate({}, { $inc: { "latestID": 1 } });

            const sessionCol = database.collection('sessions');
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

            const recordsCol = database.collection("records");
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

            const recordsCol = database.collection("records");
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

router.delete('/:recordId', async (req, res) => {
    writeLog(LOG_LEVEL.INFO, `getting record, ${req.params.recordId}`);

    const recordId = req.params.recordId;

    try {

        const recordCol = database.collection('records');
        await recordCol.deleteOne({ id: recordId });

        res.status(200).json({ message: "Success" });
    } catch (error) {
        writeLog(LOG_LEVEL.ERROR, `Error getting record ${error}`);
        res.status(500).json({ error: 'Could not get record due to Internal Server Error' });
    }
});


module.exports = router;