import { LOG_LEVEL, writeLog } from '../../utils/logger.js';

// DEPRECATED but used for migration
const LATEST_RECORD_ID_COLLECTION_NAME = 'latestRecordId';

// NEW DATA
const ID_COUNTER_COLLECTION_NAME = 'idCounters';

export const SEQUENCE_NAMES = {
    USERS: 'users',
    RECORDS: 'records',
};

let idCounterCollection;

export async function initializeIDCounterCollection(database) {
    writeLog(LOG_LEVEL.INFO, 'initializeIDCounterCollection...');

    try {
        // create the collection.
        const collections = await database
            .listCollections({ name: ID_COUNTER_COLLECTION_NAME })
            .toArray();
        if (!collections.length) {
            await database.createCollection(ID_COUNTER_COLLECTION_NAME);
        }

        idCounterCollection = database.collection(ID_COUNTER_COLLECTION_NAME);

        // add indexes
        const recordIdIndexExists = await idCounterCollection.indexExists('sequenceName');
        if (!recordIdIndexExists) {
            await idCounterCollection.createIndex({
                sequenceName: 1,
            });
        }

        // add needed documents
        for (const sequenceName of Object.values(SEQUENCE_NAMES)) {
            const document = await idCounterCollection.findOne({ sequenceName });
            if (!document) {
                await idCounterCollection.insertOne({
                    sequenceName,
                    sequenceValue: 1,
                });
            }
        }

        // migrations
        await migrateOldData(database);
        writeLog(LOG_LEVEL.INFO, 'Finished initializeIDCounterCollection...');
    } catch (error) {
        writeLog(LOG_LEVEL.ERROR, `Error initializing ID counter collection: ${error}`);
    }
}

async function migrateOldData(database) {
    try {
        // replace latestRecordId with idCounters
        const collections = await database
            .listCollections({ name: LATEST_RECORD_ID_COLLECTION_NAME })
            .toArray();

        if (collections.length > 0) {
            const oldCollection = database.collection(LATEST_RECORD_ID_COLLECTION_NAME);

            const latestRecordDoc = await oldCollection.findOne();
            if (latestRecordDoc) {
                const latestId = latestRecordDoc.latestId;
                await idCounterCollection.findOneAndUpdate(
                    { sequenceName: SEQUENCE_NAMES.RECORDS },
                    { $set: { sequenceValue: latestId } },
                );
            }

            await oldCollection.drop();
        }
    } catch (error) {
        throw error;
    }
}

export async function getNextSequenceValue(sequenceName) {
    try {
        // updates the sequence value for the next document
        const document = await idCounterCollection.findOneAndUpdate(
            { sequenceName },
            { $inc: { sequenceValue: 1 } },
            { returnDocument: 'before' },
        );
        return document.value.sequenceValue;
    } catch (error) {
        throw error;
    }
}

export async function resetSequenceValue(sequenceName) {
    try {
        // updates the sequence value for the next document
        const document = await idCounterCollection.findOneAndUpdate(
            { sequenceName },
            { $set: { sequenceValue: 1 } },
            { returnDocument: 'after' },
        );
        return document.sequenceValue;
    } catch (error) {
        throw error;
    }
}
