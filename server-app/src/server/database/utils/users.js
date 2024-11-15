import { LOG_LEVEL, writeLog } from '../../utils/logger.js';
import { getNextSequenceValue, SEQUENCE_NAMES } from './idCounters.js';

const USER_COLLECTION_NAME = 'users';

let userCollection;

export async function initializeUserCollection(database) {
    writeLog(LOG_LEVEL.INFO, 'initializeUserCollection...');
    try {
        // create the collection.
        const collections = await database
            .listCollections({ name: USER_COLLECTION_NAME })
            .toArray();
        if (!collections.length) {
            await database.createCollection(USER_COLLECTION_NAME);
        }

        userCollection = database.collection(USER_COLLECTION_NAME);
        // add indexes
        const userDeviceIdIndexExists = await userCollection.indexExists('deviceId');
        if (!userDeviceIdIndexExists) {
            await userCollection.createIndex({
                deviceId: 1,
            });
        }

        writeLog(LOG_LEVEL.INFO, 'Finished initializeUserCollection...');
    } catch (error) {
        writeLog(LOG_LEVEL.ERROR, `Error initializing user collection: ${error}`);
    }
}

export async function getOrCreateUser(deviceId) {
    let user;
    try {
        user = await getUser(deviceId);
        if (!user) {
            user = await createNewUser(deviceId);
        }

        return user;
    } catch (error) {
        throw error;
    }
}

export async function createNewUser(deviceId) {
    try {
        const userId = await getNextSequenceValue(SEQUENCE_NAMES.USERS);
        const username = `user-${userId}`;

        const user = {
            deviceId,
            userId,
            username,
        };

        await userCollection.insertOne(user);

        return user;
    } catch (error) {
        throw error;
    }
}

export async function getUser(deviceId) {
    try {
        const record = await userCollection.findOne({ deviceId });
        return record;
    } catch (error) {
        throw error;
    }
}
