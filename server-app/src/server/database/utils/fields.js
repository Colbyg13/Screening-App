import { LOG_LEVEL, writeLog } from '../../utils/logger.js';

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

        // Remove duplicate entries
        fieldCollection.aggregate([
            {
                $group: {
                    _id: "$key",
                    dups: { $addToSet: "$_id" },
                    count: { $sum: 1 }
                }
            },
            { $match: { count: { $gt: 1 } } }
        ]).forEach(function (doc) {
            doc.dups.shift();  // Keep one document
            fieldCollection.deleteMany({ _id: { $in: doc.dups } });
        })

        // Add indexes
        const fieldUniqueKeyIndex = await fieldCollection.indexExists('key');
        if (!fieldUniqueKeyIndex) {
            await fieldCollection.createIndex({
                key: 1,
            }, {
                unique: true
            });
        }

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
        writeLog(LOG_LEVEL.ERROR, `Error initializing field collection - ${error}`);
        throw error;
    }
}

export async function getFields() {
    try {
        const fields = await fieldCollection.find({}).toArray();
        return fields;
    } catch (error) {
        writeLog(LOG_LEVEL.ERROR, `Error in getFields - ${error}`);
        throw error;
    }
}

export async function upsertMultipleFields({ fields = [] }) {
    try {
        await fieldCollection.bulkWrite([
            ...fields.map(({ _id, ...field }) => ({
                updateOne: {
                    filter: { key: field.key },
                    upsert: true,
                    update: {
                        $set: field,
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
    }
}
