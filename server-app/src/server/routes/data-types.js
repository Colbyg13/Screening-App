const express = require('express');
const router = express.Router();
const { client } = require('../db');
const { LOG_LEVEL, writeLog } = require("../utils/logger");

router.get('/', async (req, res) => {
    writeLog(LOG_LEVEL.INFO, `Getting custom data types`);
    try {
        const db = client.db();

        const dataTypesCol = db.collection('customDataTypes');
        const customData = await dataTypesCol.find().toArray();

        res.status(200).json(customData);
    } catch (error) {
        writeLog(LOG_LEVEL.ERROR, `Error getting custom data types ${error}`);
        res.status(500).json({ error: 'Could not get custom data types due to Internal Server Error' });
    }
});

module.exports = router;