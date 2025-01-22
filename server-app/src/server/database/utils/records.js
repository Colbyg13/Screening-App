import { ObjectId } from 'mongodb';
import convert, { getBaseUnit } from '../../../utils/convert.js';
import { LOG_LEVEL, writeLog } from '../../utils/logger.js';
import { getNextSequenceValue, SEQUENCE_NAMES } from './idCounters.js';
import { getSingleSession } from './sessions.js';

const RECORD_COLLECTION_NAME = 'records';

let recordCollection;

export async function initializeRecordCollection(database) {
    writeLog(LOG_LEVEL.INFO, 'initializeRecordCollection...');
    try {
        // create the collection.
        const collections = await database
            .listCollections({ name: RECORD_COLLECTION_NAME })
            .toArray();
        if (!collections.length) {
            await database.createCollection(RECORD_COLLECTION_NAME);
        }

        recordCollection = database.collection(RECORD_COLLECTION_NAME);
        // add indexes
        const recordIdIndexExists = await recordCollection.indexExists('id');
        if (!recordIdIndexExists) {
            await recordCollection.createIndex({
                id: 1,
            });
        }
        const recordsessionIdIndexExists = await recordCollection.indexExists('sessionId');
        if (!recordsessionIdIndexExists) {
            await recordCollection.createIndex({
                sessionId: 1,
            });
        }

        writeLog(LOG_LEVEL.INFO, 'Finished initializeRecordCollection...');
    } catch (error) {
        writeLog(LOG_LEVEL.ERROR, `Error initializing record collection: ${error}`);
        throw error;
    }
}

export async function getRecordCount() {
    try {
        const recordCount = await recordCollection.count({});
        return recordCount;
    } catch (error) {
        writeLog(LOG_LEVEL.ERROR, `Error getRecordCount - ${error}`);
        throw error;
    }
}

export async function getRecordsBySessionId({ sessionId, unitConversions }) {
    try {
        const sessionRecords = await recordCollection.find({ sessionId }).toArray();
        const convertedRecords = sessionRecords.map(record =>
            convertRecordFromBaseUnits(record, unitConversions),
        );
        return convertedRecords;
    } catch (error) {
        writeLog(LOG_LEVEL.ERROR, `Error getRecordsBySessionId - ${error}, args: ${JSON.stringify(arguments)}`);
        throw error;
    }
}

export async function getRecords({ find, sort, skip, pageSize, unitConversions }) {
    try {
        const records = await recordCollection
            .find(find)
            .sort(sort)
            .skip(skip)
            .limit(pageSize)
            .toArray();

        const convertedRecords = records.map(record =>
            convertRecordFromBaseUnits(record, unitConversions),
        );

        return convertedRecords;
    } catch (error) {
        writeLog(LOG_LEVEL.ERROR, `Error getRecords - ${error}, args: ${JSON.stringify(arguments)}`);
        throw error;
    }
}

export async function getSingleRecord({ recordId, unitConversions }) {
    try {
        const record = await recordCollection.findOne({ _id: new ObjectId(recordId) });
        return convertRecordFromBaseUnits(record, unitConversions);
    } catch (error) {
        writeLog(LOG_LEVEL.ERROR, `Error getSingleRecord - ${error}, args: ${JSON.stringify(arguments)}`);
        throw error;
    }
}

export async function createRecord({ record, customData }) {
    if (!record.sessionId) {
        throw new Error('Records cannot be created without a sessionId');
    }

    try {
        const nextRecordId = await getNextSequenceValue(SEQUENCE_NAMES.RECORDS);

        const sessionData = await getSingleSession({ sessionId: record.sessionId });

        const generalInfo = sessionData.generalFields.reduce((generalInfo, { key, value }) => {
            generalInfo[key] = value;
            return generalInfo;
        }, {});

        // put the record in the DB with base units for better conversion
        const newRecord = convertRecordToBaseUnits({
            id: nextRecordId,
            createdAt: new Date(),
            lastModified: new Date(),
            customData: customData ?? {},
            ...generalInfo,
            ...record,
        });

        const result = recordCollection.insertOne(newRecord, {});

        const newRecordWithId = convertRecordFromBaseUnits({
            _id: result.insertedId,
            ...newRecord,
        });

        return newRecordWithId;
    } catch (error) {
        writeLog(LOG_LEVEL.ERROR, `Error createRecord - ${error}, args: ${JSON.stringify(arguments)}`);
        throw error;
    }
}

export async function updateRecord({ record, customData }) {
    // remove _id and sessionId as they cannot be overridden
    const { _id, sessionId, customData: recordCustomData, ...recordRest } = record;
    const fullCustomData = { ...recordCustomData, ...customData };
    const recordUpdate = convertRecordToBaseUnits(recordRest, fullCustomData);

    // we only want to update the custom values that were updated with this update
    const updatedCustomDataKeyValues = Object.entries(fullCustomData).reduce(
        (updatedCustomDataKeyValues, [key, value]) => {
            if (record[key] !== undefined) {
                updatedCustomDataKeyValues[key] = value;
            }
            return updatedCustomDataKeyValues;
        },
        {},
    );

    try {
        const result = await recordCollection.findOneAndUpdate(
            { id: record.id },
            {
                $set: {
                    lastModified: new Date(),
                    ...recordUpdate,
                    // only updates the fields the record is tied to
                    ...Object.entries(updatedCustomDataKeyValues).reduce(
                        (customDataUpdates, [key, value]) => {
                            customDataUpdates[`customData.${key}`] = value;
                            return customDataUpdates;
                        },
                        {},
                    ),
                },
            },
            { returnDocument: 'after' },
        );

        const updatedRecord = convertRecordFromBaseUnits(result.value);
        return updatedRecord;
    } catch (error) {
        writeLog(LOG_LEVEL.ERROR, `Error updateRecord - ${error}, args: ${JSON.stringify(arguments)}`);
        throw error;
    }
}

export async function deleteRecord({ recordId }) {
    try {
        await recordCollection.deleteOne({ id: recordId });
        return true;
    } catch (error) {
        throw error;
    }
}

function convertRecordFromBaseUnits(record, unitConversions) {
    const completeUnitConversion = {
        ...record.customData,
        ...unitConversions,
    };

    const convertedRecord = Object.entries(completeUnitConversion).reduce(
        (convertedRecord, [key, unit]) => {
            const value = +record[key];
            if (!isNaN(value)) {
                const baseUnit = getBaseUnit(unit);
                if (baseUnit !== unit) {
                    return {
                        ...convertedRecord,
                        [key]: convert(value).from(baseUnit).to(unit),
                    };
                }
            }
            return convertedRecord;
        },
        record,
    );

    return convertedRecord;
}

function convertRecordToBaseUnits(record, unitConversions) {
    const completeUnitConversion = {
        ...record.customData,
        ...unitConversions,
    };

    const convertedRecord = Object.entries(completeUnitConversion).reduce(
        (convertedRecord, [key, unit]) => {
            const value = record[key] === '' ? NaN : +record[key];
            if (!isNaN(value)) {
                const baseUnit = getBaseUnit(unit);
                convertedRecord[key] =
                    baseUnit === unit ? value : convert(value).from(unit).to(baseUnit);
            }
            return convertedRecord;
        },
        record,
    );

    return convertedRecord;
}
