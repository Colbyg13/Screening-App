const { MongoClient } = require("mongodb");
const uri = 'mongodb://127.0.0.1:27017';
const DB_NAME = 'screening_app';
const { LOG_LEVEL, writeLog } = require("./utils/logger");

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function connectToMongo() {
    try {
        await client.connect();
        writeLog(LOG_LEVEL.INFO, `Connected to DB: ${DB_NAME}`);
        const db = client.db();


        // SETUP TASKS
        await ensureDocumentsExist(db);
        await createIndexes(db);

    } catch (error) {
        writeLog(LOG_LEVEL.ERROR, `Error connecting to DB: ${DB_NAME}`);
    }
}


async function ensureDocumentsExist(db) {
    writeLog(LOG_LEVEL.INFO, 'Ensuring collection has needed documents...');

    // CHECK FIELDS
    const collection = db.collection('fields');

    // Check if a document exists and create it if necessary
    const documentsToEnsure = [
        { key: 'id' },
        { key: 'createdAt' },
    ];

    for (const document of documentsToEnsure) {
        const existingDocument = await collection.findOne(document);

        if (!existingDocument) {
            // Document doesn't exist, create it
            await collection.insertOne(document);
        }
    }

    // CHECK ID
    const lastRecord = APP.db.collection('latestRecordID');
    const result = await lastRecord.countDocuments();
    if (result === 0) {
        lastRecord.insertOne({ latestID: 1 });
        localStorage.clear();
    }

    writeLog(LOG_LEVEL.INFO, 'Finished ensuring collection has needed documents...');

}

async function createIndexes(db) {
    writeLog(LOG_LEVEL.INFO, 'Creating indexes...');

    const collection = db.collection('records');

    // Example: Create an index on a field called 'name'
    const indexExists = await collection.indexExists('id');
    if (!indexExists) {
        await collection.createIndex({
            id: 1
        });
    }

    writeLog(LOG_LEVEL.INFO, 'Finished creating indexes...');
}

connectToMongo();

// Export the MongoDB client to use it in other parts of your application
module.exports = { client };
