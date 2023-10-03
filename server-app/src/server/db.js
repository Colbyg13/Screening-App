const { MongoClient } = require("mongodb");
const uri = 'mongodb://127.0.0.1:27017';
const DB_NAME = 'screening_app';
const { LOG_LEVEL, writeLog } = require("./utils/logger");

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const database = client.db(DB_NAME);

async function connectToMongo() {
    try {
        await client.connect();
        writeLog(LOG_LEVEL.INFO, `Connected to Mongo`);

        // SETUP TASKS
        await createMandatoryCollections();
        await ensureDocumentsExist();
        await createIndexes();

    } catch (error) {
        writeLog(LOG_LEVEL.ERROR, `Error connecting to DB: ${error}`);
    }
}

async function createMandatoryCollections() {
    writeLog(LOG_LEVEL.INFO, 'Creating needed collections...');
    try {
        const collections = await database.listCollections().toArray();
        if (!collections.some(({ name }) => name === 'records')) {
            await database.createCollection('records');
        }
    } catch (error) {
        writeLog(LOG_LEVEL.ERROR, `Error creating collections: ${error}`);
    }
    writeLog(LOG_LEVEL.INFO, 'Finished creating needed collections.');
}

async function ensureDocumentsExist() {
    writeLog(LOG_LEVEL.INFO, 'Ensuring collection has needed documents...');

    // CHECK FIELDS
    const fieldsCollection = database.collection('fields');

    // Check if a document exists and create it if necessary
    const documentsToEnsure = [
        { key: 'id' },
        { key: 'createdAt' },
    ];

    for (const document of documentsToEnsure) {
        const filter = { key: document.key };
        const update = { $setOnInsert: document };

        await fieldsCollection.updateOne(filter, update, { upsert: true });
    }

    // CHECK ID
    const lastRecord = database.collection('latestRecordID');
    const result = await lastRecord.countDocuments();
    if (result === 0) {
        await lastRecord.insertOne({ latestID: 1 });
    }

    writeLog(LOG_LEVEL.INFO, 'Finished ensuring collection has needed documents...');

}

async function createIndexes() {
    writeLog(LOG_LEVEL.INFO, 'Creating indexes...');

    const recordsCollection = database.collection('records');

    const indexExists = await recordsCollection.indexExists('id');
    if (!indexExists) {
        await recordsCollection.createIndex({
            id: 1
        });
    }

    writeLog(LOG_LEVEL.INFO, 'Finished creating indexes...');
}

connectToMongo();

module.exports = { database };
