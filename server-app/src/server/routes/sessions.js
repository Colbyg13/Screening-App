const express = require('express');
const router = express.Router();
const { database } = require('../db');
const { LOG_LEVEL, writeLog } = require("../utils/logger");

router.get('/', async (req, res) => {
    writeLog(LOG_LEVEL.INFO, `Getting sessions`);
    try {

        const sessionsCol = database.collection('sessions');
        const sessions = await sessionsCol.find({}).toArray();

        res.status(200).json(sessions);
    } catch (error) {
        writeLog(LOG_LEVEL.ERROR, `Error getting sessions ${error}`);
        res.status(500).json({ error: 'Could not get sessions due to Internal Server Error' });
    }
});

router.get('/:sessionId', async (req, res) => {

    const {
        params: {
            sessionId,
        },
    } = req;

    writeLog(LOG_LEVEL.INFO, `Getting session: ${sessionId}`);
    try {

        const sessionCol = database.collection('sessions');
        const session = await sessionCol.findOne({ _id: sessionId });

        res.status(200).json(session);
    } catch (error) {
        writeLog(LOG_LEVEL.ERROR, `Error getting session ${error}`);
        res.status(500).json({ error: 'Could not get session due to Internal Server Error' });
    }
});

module.exports = router;