import { ObjectId } from 'mongodb';
import { LOG_LEVEL, writeLog } from '../../utils/logger.js';
import { getNextSequenceValue, SEQUENCE_NAMES } from './idCounters.js';

const SESSION_COLLECTION_NAME = 'sessions';

let sessionCollection;

export async function initializeSessionCollection(database) {
    writeLog(LOG_LEVEL.INFO, 'initializeSessionCollection...');
    try {
        // create the collection.
        const collections = await database
            .listCollections({ name: SESSION_COLLECTION_NAME })
            .toArray();
        if (!collections.length) {
            await database.createCollection(SESSION_COLLECTION_NAME);
        }

        sessionCollection = database.collection(SESSION_COLLECTION_NAME);

        writeLog(LOG_LEVEL.INFO, 'Finished initializeSessionCollection...');
    } catch (error) {
        writeLog(LOG_LEVEL.ERROR, `Error initializing session collection: ${error}`);
    }
}

export async function getSessions() {
    try {
        const sessions = await sessionCollection.find({}).toArray();
        return sessions;
    } catch (error) {
        throw error;
    }
}

export async function getSingleSession({ sessionId }) {
    try {
        const session = await sessionCollection.findOne({ _id: new ObjectId(sessionId) });
        return session;
    } catch (error) {
        throw error;
    }
}
