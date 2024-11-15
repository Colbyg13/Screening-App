const express = require('express');
const router = express.Router();
const { LOG_LEVEL, writeLog } = require('../utils/logger');
const { getSessions, getSingleSession } = require('../database/utils/sessions');

router.get('/', async (req, res) => {
    writeLog(LOG_LEVEL.INFO, `Getting sessions`);
    try {
        const sessions = await getSessions();
        res.status(200).json(sessions);
    } catch (error) {
        writeLog(LOG_LEVEL.ERROR, `Error getting sessions ${error}`);
        res.status(500).json({ error: 'Could not get sessions due to Internal Server Error' });
    }
});

router.get('/:sessionId', async (req, res) => {
    const {
        params: { sessionId },
    } = req;

    writeLog(LOG_LEVEL.INFO, `Getting session: ${sessionId}`);
    try {
        const session = await getSingleSession({ sessionId });

        res.status(200).json(session);
    } catch (error) {
        writeLog(LOG_LEVEL.ERROR, `Error getting session ${error}`);
        res.status(500).json({ error: 'Could not get session due to Internal Server Error' });
    }
});

module.exports = router;
