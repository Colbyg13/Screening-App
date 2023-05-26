const { MongoClient } = require("mongodb");
const url = 'mongodb://127.0.0.1:27017';
const DB_NAME = 'screening_app';
const { LOG_LEVEL, writeLog} = require("./utils/logger");

module.exports = async APP => {

    try {
        const client = await MongoClient.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        APP.db = client.db(DB_NAME);
        APP.connectedToDB = true;

        writeLog(LOG_LEVEL.INFO, `Connected to DB: ${DB_NAME}`);
        // insert last record for patient ids if not exists
        const lastRecord = APP.db.collection('latestRecordID');
        const result = await lastRecord.countDocuments();
        if (result === 0) {
            lastRecord.insertOne({ latestID: 1 });
            localStorage.clear();
        }

        // defined fields to sort on
        const defaultFields = [{
            name: 'Id',
            type: 'string',
            key: 'id',
        }, {
            name: 'Created',
            type: 'date',
            key: 'createdAt',
        }].map(field => ({
            updateOne: {
                filter: { key: field.key },
                upsert: true,
                update: {
                    $set: field,
                }
            }
        }));

        APP.db.collection("fields").bulkWrite(defaultFields);

    } catch (err) {
        writeLog(LOG_LEVEL.ERROR, `Could not connect to DB: ${err}`);
    }
    
    writeLog(LOG_LEVEL.INFO, '-- completed connecting DB --');

    return APP;
}