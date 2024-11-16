const express = require('express');
const router = express.Router();
const { LOG_LEVEL, writeLog } = require('../utils/logger');
const { getFields } = require('../database/utils/fields');

router.get('/', async (req, res) => {
    try {
        const fields = await getFields();
        res.status(200).json(fields);
    } catch (error) {
        writeLog(LOG_LEVEL.ERROR, `Error getting fields ${error}`);
        res.status(500).json({ error: 'Could not get fields due to Internal Server Error' });
    }
});

module.exports = router;
