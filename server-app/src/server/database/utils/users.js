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

        userCollection =  database.collection(USER_COLLECTION_NAME);
        // add indexes
        const userDeviceIDIndexExists = await userCollection.indexExists('deviceID');
        if (!userDeviceIDIndexExists) {
            await userCollection.createIndex({
                deviceID: 1,
            });
        }

        writeLog(LOG_LEVEL.INFO, 'Finished initializeUserCollection...');
    } catch (error) {
        writeLog(LOG_LEVEL.ERROR, `Error initializing user collection: ${error}`);
    }
}

export async function createNewUser(deviceID) {
    writeLog(LOG_LEVEL.INFO, `Creating new user: ${deviceID}`);

    try {
        const userID = await getNextSequenceValue(SEQUENCE_NAMES.USERS);
        const username = `user-${userID}`;

        const user = {
            deviceID,
            userID,
            username,
        }

        await userCollection.insertOne(user);

        return user;
    } catch (error) {
        writeLog(LOG_LEVEL.ERROR, `Error creating new user: ${error}`);
        throw error;
    }
}

export async function getUser(deviceID) {
    writeLog(LOG_LEVEL.INFO, `Getting user: ${deviceID}`);

    try {
        const record = await userCollection.findOne({ deviceID });
        return record;
    } catch (error) {
        writeLog(LOG_LEVEL.ERROR, `Error getting user: ${error}`);
        throw error;
    }
}
