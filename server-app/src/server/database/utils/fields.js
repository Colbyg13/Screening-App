import { ObjectId } from 'mongodb';
import { LOG_LEVEL, writeLog } from '../../utils/logger.js';
import { getNextSequenceValue, SEQUENCE_NAMES } from './idCounters.js';

const FIELD_COLLECTION_NAME = 'fields';

let fieldCollection;

export async function initializeFieldCollection(database) {
    writeLog(LOG_LEVEL.INFO, 'initializeFieldCollection...');
    try {
        // create the collection.
        const collections = await database
            .listCollections({ name: FIELD_COLLECTION_NAME })
            .toArray();
        if (!collections.length) {
            await database.createCollection(FIELD_COLLECTION_NAME);
        }

        fieldCollection = database.collection(FIELD_COLLECTION_NAME);

        // Put needed documents in the DB
        const mandatoryDocuments = [
            { key: 'id', name: 'Id', type: 'string' },
            { key: 'createdAt', name: 'Created At', type: 'date' },
        ];

        for (const document of mandatoryDocuments) {
            const filter = { key: document.key };
            const update = { $setOnInsert: document };

            await fieldCollection.updateOne(filter, update, { upsert: true });
        }

        writeLog(LOG_LEVEL.INFO, 'Finished initializeFieldCollection...');
    } catch (error) {
        writeLog(LOG_LEVEL.ERROR, `Error initializing field collection: ${error}`);
    }
}

export async function getFields() {
    writeLog(LOG_LEVEL.INFO, `Getting field`);

    try {
        const fields = await fieldCollection.find({}).toArray();
        return fields;
    } catch (error) {
        writeLog(LOG_LEVEL.ERROR, `Error getting fields ${error}`);
        throw error;
    }
}

// TODO: Finish up CRUD operations so we can remove them from elsewhere
