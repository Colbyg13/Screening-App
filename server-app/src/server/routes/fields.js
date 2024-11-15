const express = require('express');
const router = express.Router();
const { database } = require('../database/db');
const { LOG_LEVEL, writeLog } = require('../utils/logger');

router.get('/', async (req, res) => {
    try {
        const fieldsCol = database.collection('fields');
        const fields = await fieldsCol.find({}).toArray();

        res.status(200).json(fields);
    } catch (error) {
        writeLog(LOG_LEVEL.ERROR, `Error getting fields ${error}`);
        res.status(500).json({ error: 'Could not get fields due to Internal Server Error' });
    }
});

module.exports = router;
