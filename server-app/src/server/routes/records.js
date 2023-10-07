const express = require('express');
const router = express.Router();
const { database } = require('../db');
const { LOG_LEVEL, writeLog } = require("../utils/logger");
const { removeEmptyValues } = require("../utils/index");
const { ObjectId } = require('mongodb');
const { default: convert, getBaseUnit } = require('../../utils/convert');
const io = global.io;

const pageSize = 50;

router.get('/', async (req, res) => {
    writeLog(LOG_LEVEL.INFO, `getting records, ${JSON.stringify(req.query)}`);

    const {
        query: {
            // Getting record count
            getCount = false,

            // Getting records based on sessionID
            sessionId,

            // Search records
            search = "",
            sort = {},
            page = 0,

            // other record data
            unitConversions = {},
        } = {},
    } = req;

    function convertRecordFromBaseUnits(record) {
        const completeUnitConversion = {
            ...record.customData,
            ...unitConversions
        }
        const convertedRecord = Object.entries(completeUnitConversion).reduce((convertedRecord, [key, unit]) => {
            const value = +record[key];
            if (!isNaN(value)) {
                const baseUnit = getBaseUnit(unit);
                if (baseUnit !== unit) {
                    return {
                        ...convertedRecord,
                        [key]: convert(value).from(baseUnit).to(unit),
                    };
                }
            }
            return convertedRecord;
        }, record);

        return convertedRecord;
    }

    const recordsCol = database.collection('records');

    // if we just want the count
    if (getCount) {
        try {
            const recordCount = await recordsCol.count({});
            res.status(200).json(recordCount);
        } catch (error) {
            writeLog(LOG_LEVEL.ERROR, `Error getting record count ${error}`);
            res.status(500).json({ error: 'Could not get record count due to Internal Server Error' });
        }
        return;
    }

    if (sessionId !== undefined) {
        try {
            const sessionRecords = await recordsCol.find({ sessionId: new ObjectId(sessionId) }).toArray();

            const convertedRecords = sessionRecords.map(convertRecordFromBaseUnits);
            res.status(200).json(convertedRecords);
        } catch (error) {
            writeLog(LOG_LEVEL.ERROR, `Error getting session records ${error}`);
            res.status(500).json({ error: 'Could not get session records due to Internal Server Error' });
        }
        return;
    }

    try {
        const skip = page * pageSize;

        const find = search ? {
            $or: ['id', 'name'].map(key => ({
                $expr: {
                    $regexMatch: {
                        input: { "$toString": `$${key}` },
                        regex: new RegExp(search, 'i'),
                    }
                }
            })),
        } : {};

        const records = await recordsCol.find(find)
            .sort(sort)
            .skip(skip)
            .limit(pageSize)
            .toArray();

        const convertedRecords = records.map(convertRecordFromBaseUnits);

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

        const recordsCol = database.collection('records');
        const record = await recordsCol.findOne({ _id: new ObjectId(recordId) });

        res.status(200).json(record);
    } catch (error) {
        writeLog(LOG_LEVEL.ERROR, `Error getting record ${error}`);
        res.status(500).json({ error: 'Could not get record due to Internal Server Error' });
    }
});

router.post('/', async (req, res) => {
    writeLog(LOG_LEVEL.INFO, `creating/updating records: ${JSON.stringify(req.body)}`);

    const {
        record = {},
        // need this separate if offline more or other reasons
        customData,
    } = req.body;

    const creatingRecord = !record.id;
    const sessionId = record?.sessionId;

    function convertRecordToBaseUnits(record) {
        const convertedRecord = Object.entries(customData ?? {}).reduce((convertedRecord, [key, unit]) => {
            const value = +record[key];
            if (!isNaN(value)) {
                const baseUnit = getBaseUnit(unit);
                return {
                    ...convertedRecord,
                    [key]: baseUnit === unit ? value : convert(value).from(unit).to(baseUnit),
                };
            }
            return convertedRecord;
        }, record);

        return convertedRecord;
    }

    if (!sessionId) {
        writeLog(LOG_LEVEL.ERROR, `Error updating record: Cannot create or update record without a sessionId`);
        res.status(400).json({ error: 'Cannot create or update record without a sessionId' });
        return;
    }

    if (creatingRecord) {
        try {

            const latestIDCol = database.collection('latestRecordID');
            const updatedRecordID = await latestIDCol.findOneAndUpdate({}, { $inc: { "latestID": 1 } });

            const sessionCol = database.collection('sessions');
            const sessionData = await sessionCol.findOne({ _id: new ObjectId(sessionId) });

            const generalInfo = sessionData.generalFields.reduce((all, { key, value }) => ({
                ...all,
                [key]: value,
            }), {});

            const newRecord = {
                id: updatedRecordID.value.latestID,
                createdAt: new Date(),
                lastModified: new Date(),
                sessionId,
                customData: customData ?? {},
                ...generalInfo,
                ...removeEmptyValues(convertRecordToBaseUnits(record)),
            };

            const recordsCol = database.collection("records");
            const result = recordsCol.insertOne(newRecord);

            const newRecordWithId = {
                _id: result.insertedId,
                ...newRecord,
            };

            io.sockets.emit('record-created', newRecordWithId);

            res.status(200).json(newRecordWithId);
        } catch (error) {
            writeLog(LOG_LEVEL.ERROR, `Error creating record: ${error}`);
            res.status(500).json({ error: 'Could not update record due to Internal Server Error' });
        }
    } else {

        const recordUpdate = removeEmptyValues(convertRecordToBaseUnits({
            ...record,
            _id: undefined, // need to remove so we don't override
        }));

        try {
            const recordsCol = database.collection("records");
            const result = await recordsCol.findOneAndUpdate(
                { id: record.id },
                {
                    $set: {
                        lastModified: new Date(),
                        ...recordUpdate,
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

            res.status(200).json(updatedRecord);
        } catch (error) {
            writeLog(LOG_LEVEL.ERROR, `Error creating record: ${error}`);
            res.status(500).json({ error: 'Could not update record due to Internal Server Error' });
        }
    }
});

router.delete('/:recordId', async (req, res) => {
    writeLog(LOG_LEVEL.INFO, `deleting record, ${req.params.recordId}`);

    const recordId = +req.params.recordId;

    try {

        const recordsCol = database.collection('records');
        await recordsCol.deleteOne({ id: recordId });

        res.status(200).json({ message: "Success" });
    } catch (error) {
        writeLog(LOG_LEVEL.ERROR, `Error deleting record: ${error}`);
        res.status(500).json({ error: 'Could not get record due to Internal Server Error' });
    }
});

module.exports = router;