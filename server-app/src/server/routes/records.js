const express = require('express');
const router = express.Router();
const { LOG_LEVEL, writeLog } = require('../utils/logger');
const {
    getRecordsBySessionId,
    getRecordCount,
    getRecords,
    getSingleRecord,
    createRecord,
    updateRecord,
    deleteRecord,
} = require('../database/utils/records');
const io = global.io;

const pageSize = 50;

router.get('/', async (req, res) => {
    writeLog(LOG_LEVEL.INFO, `getting records, ${JSON.stringify(req.query)}`);

    const {
        query: {
            // Getting record count
            getCount = false,

            // Getting records based on sessionId
            sessionId,

            // Search records
            search = '',
            sort = {},
            page = 0,

            // other record data
            unitConversions = {},
        } = {},
    } = req;

    // if we just want the count
    if (getCount) {
        try {
            const recordCount = await getRecordCount();
            res.status(200).json(recordCount);
        } catch (error) {
            writeLog(LOG_LEVEL.ERROR, `Error getting record count ${error}`);
            res.status(500).json({
                error: 'Could not get record count due to Internal Server Error',
            });
        }
        return;
    }

    if (sessionId !== undefined) {
        try {
            const convertedRecords = await getRecordsBySessionId({ sessionId, unitConversions });

            res.status(200).json(convertedRecords);
        } catch (error) {
            writeLog(LOG_LEVEL.ERROR, `Error getting session records ${error}`);
            res.status(500).json({
                error: 'Could not get session records due to Internal Server Error',
            });
        }
        return;
    }

    try {
        const skip = page * pageSize;

        const find = search
            ? {
                  $or: ['id', 'name'].map(key => ({
                      $expr: {
                          $regexMatch: {
                              input: { $toString: `$${key}` },
                              regex: new RegExp(search, 'i'),
                          },
                      },
                  })),
              }
            : {};

        const records = await getRecords({ find, sort, skip, pageSize, unitConversions });

        res.status(200).json(records);
    } catch (error) {
        writeLog(LOG_LEVEL.ERROR, `Error getting records ${error}`);
        res.status(500).json({ error: 'Could not get records due to Internal Server Error' });
    }
});

router.get('/:recordId', async (req, res) => {
    writeLog(LOG_LEVEL.INFO, `getting record, ${req.params.recordId}`);

    const { query: { unitConversions = {} } = {}, params: { recordId } = {} } = req;

    try {
        const record = await getSingleRecord({ recordId, unitConversions });

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
        // need this separate if offline mode or other reasons
        customData,
    } = req.body;

    const creatingRecord = !record.id;
    const sessionId = record?.sessionId;

    if (creatingRecord && !sessionId) {
        writeLog(
            LOG_LEVEL.ERROR,
            `Error Creating record: Cannot create record without a sessionId`,
        );
        res.status(400).json({ error: 'Cannot create a record without a sessionId' });
        return;
    }

    if (creatingRecord) {
        try {
            const newRecord = await createRecord({ record, customData });
            io.sockets.emit('record-created', newRecord);
            res.status(200).json(newRecord);
        } catch (error) {
            writeLog(LOG_LEVEL.ERROR, `Error creating record: ${error}`);
            res.status(500).json({ error: 'Could not update record due to Internal Server Error' });
        }
        return;
    }

    try {
        const updatedRecord = await updateRecord({ record, customData });

        io.sockets.emit('record-updated', updatedRecord);
        res.status(200).json(updatedRecord);
    } catch (error) {
        writeLog(LOG_LEVEL.ERROR, `Error creating record: ${error}`);
        res.status(500).json({ error: 'Could not update record due to Internal Server Error' });
    }
});

router.delete('/:recordId', async (req, res) => {
    writeLog(LOG_LEVEL.INFO, `deleting record, ${req.params.recordId}`);

    const recordId = +req.params.recordId;

    try {
        await deleteRecord({ recordId });
        res.status(200).json({ message: 'Success' });
    } catch (error) {
        writeLog(LOG_LEVEL.ERROR, `Error deleting record: ${error}`);
        res.status(500).json({ error: 'Could not get record due to Internal Server Error' });
    }
});

module.exports = router;
