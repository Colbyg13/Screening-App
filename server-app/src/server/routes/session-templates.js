const express = require('express');
const router = express.Router();
const { database } = require('../db');
const { LOG_LEVEL, writeLog } = require("../utils/logger");

router.get('/', async (req, res) => {
    writeLog(LOG_LEVEL.INFO, `Getting session templates`);
    try {

        const sessionTemplatesCol = database.collection('sessionTemplates');
        const sessionTemplates = await sessionTemplatesCol.find({}).toArray();

        res.status(200).json(sessionTemplates);
    } catch (error) {
        writeLog(LOG_LEVEL.ERROR, `Error getting session templates ${error}`);
        res.status(500).json({ error: 'Could not get session templates due to Internal Server Error' });
    }
});

router.delete('/:templateId', async (req, res) => {
    writeLog(LOG_LEVEL.INFO, `Deleting session templates, ${JSON.stringify(req.params)}`);

    const templateId = req.params.templateId;

    try {

        const sessionTemplatesCol = database.collection('sessionTemplates');
        await sessionTemplatesCol.deleteOne({ _id: templateId });

        res.status(200).json({ message: "Success" });
    } catch (error) {
        writeLog(LOG_LEVEL.ERROR, `Error deleting session template ${error}`);
        res.status(500).json({ error: 'Could not delete session template due to Internal Server Error' });
    }
});

module.exports = router;