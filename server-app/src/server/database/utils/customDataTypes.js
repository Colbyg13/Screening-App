import { ObjectId } from 'mongodb';
import { LOG_LEVEL, writeLog } from '../../utils/logger.js';

const CUSTOM_DATA_TYPE_COLLECTION_NAME = 'customDataTypes';

let customDataTypeCollection;

export async function initializeCustomDataTypeCollection(database) {
    writeLog(LOG_LEVEL.INFO, 'initializeCustomDataTypeCollection...');
    try {
        // create the collection.
        const collections = await database
            .listCollections({ name: CUSTOM_DATA_TYPE_COLLECTION_NAME })
            .toArray();
        if (!collections.length) {
            await database.createCollection(CUSTOM_DATA_TYPE_COLLECTION_NAME);
        }

        customDataTypeCollection = database.collection(CUSTOM_DATA_TYPE_COLLECTION_NAME);
        writeLog(LOG_LEVEL.INFO, 'Finished initializeCustomDataTypeCollection...');
    } catch (error) {
        writeLog(LOG_LEVEL.ERROR, `Error initializing customDataType collection - ${error}`);
        throw error;
    }
}

export async function getCustomDataTypes() {
    try {
        const customDataTypes = await customDataTypeCollection.find({}).toArray();
        return customDataTypes;
    } catch (error) {
        writeLog(LOG_LEVEL.ERROR, `Error in getCustomDataTypes - ${error}`);
        throw error;
    }
}

export async function upsertMultipleCustomDataTypes({ customDataTypes = [] }) {
    try {
        await customDataTypeCollection.bulkWrite([
            ...customDataTypes.map(({ _id, ...dataType }) => ({
                updateOne: {
                    filter: { _id: new ObjectId(_id) },
                    upsert: true,
                    update: {
                        $set: dataType,
                    },
                },
            })),
        ]);

        return true;
    } catch (error) {
        writeLog(
            LOG_LEVEL.ERROR,
            `Error upserting custom data types -  ${error}, args: ${JSON.stringify(arguments)}`,
        );
        throw error;
    }
}

export async function deleteMultipleCustomDataTypes({ dataTypeIdsToDelete = [] }) {
    try {
        await customDataTypeCollection.bulkWrite([
            ...dataTypeIdsToDelete.map(_id => ({
                deleteOne: {
                    filter: { _id: new ObjectId(_id) },
                },
            })),
        ]);

        return true;
    } catch (error) {
        writeLog(
            LOG_LEVEL.ERROR,
            `Error deleting custom data types -  ${error}, args: ${JSON.stringify(arguments)}`,
        );
        throw error;
    }
}
