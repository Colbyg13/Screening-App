const express = require('express');
const router = express.Router();
const { LOG_LEVEL, writeLog } = require('../utils/logger');
const {
    getCustomDataTypes,
    upsertMultipleCustomDataTypes,
    deleteMultipleCustomDataTypes,
} = require('../database/utils/customDataTypes');

router.get('/', async (req, res) => {
    try {
        const customData = await getCustomDataTypes();

        res.status(200).json(customData);
    } catch (error) {
        writeLog(LOG_LEVEL.ERROR, `Error getting custom data types ${error}`);
        res.status(500).json({
            error: 'Could not get custom data types due to Internal Server Error',
        });
    }
});

router.post('/', async (req, res) => {
    const {
        body: { customDataTypes = [], dataTypeIdsToDelete = [] },
    } = req;

    try {
        if (customDataTypes.length) {
            await upsertMultipleCustomDataTypes({ customDataTypes });
        }
        if (dataTypeIdsToDelete.length) {
            await deleteMultipleCustomDataTypes({ dataTypeIdsToDelete });
        }
        res.status(200).json({ message: 'Success' });
    } catch (error) {
        writeLog(LOG_LEVEL.ERROR, `Error getting custom data types ${error}`);
        res.status(500).json({
            error: 'Could not get custom data types due to Internal Server Error',
        });
    }
});

module.exports = router;
