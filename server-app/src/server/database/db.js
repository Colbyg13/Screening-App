const { MongoClient } = require('mongodb');
const { LOG_LEVEL, writeLog } = require('../utils/logger');
const { initializeIDCounterCollection } = require('./utils/idCounters');
const { initializeUserCollection } = require('./utils/users');
const { initializeRecordCollection } = require('./utils/records');
const { initializeSessionCollection } = require('./utils/sessions');
const { initializeFieldCollection } = require('./utils/fields');
const { initializeCustomDataTypeCollection } = require('./utils/customDataTypes');

const uri = 'mongodb://localhost:27017';
const DB_NAME = 'screening_app';

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const database = client.db(DB_NAME);

async function connectToMongo() {
    writeLog(LOG_LEVEL.INFO, `connecting to DB`);

    // DB CONNECTION
    try {
        await client.connect();
        writeLog(LOG_LEVEL.INFO, `Connected to Mongo`);
    } catch (error) {
        writeLog(LOG_LEVEL.ERROR, `Error connecting to DB: ${error}`);
    }

    // DB Setup
    try {
         await Promise.allSettled([
            initializeIDCounterCollection(database),
            initializeUserCollection(database),
            initializeSessionCollection(database),
            initializeRecordCollection(database),
            initializeFieldCollection(database),
            initializeCustomDataTypeCollection(database),
        ]);
    } catch (error) {
        writeLog(LOG_LEVEL.ERROR, `Error setting up db: ${error}`);
    }
}

module.exports = { database, connectToMongo };
