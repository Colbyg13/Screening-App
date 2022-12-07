const { MongoClient } = require("mongodb");
const url = 'mongodb://127.0.0.1:27017';
const DB_NAME = 'screening_app';


module.exports = async APP => {

    try {
        const client = await MongoClient.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        APP.db = client.db(DB_NAME);
        console.log("Connected to DB", DB_NAME)
        // insert last record for patient ids if not exists
        const lastRecord = APP.db.collection('latestRecordID');
        const result = await lastRecord.countDocuments();
        console.log("RESULT", result, typeof (result));
        if (result === 0) {
            lastRecord.insertOne({ latestID: 1 });
            localStorage.clear();
        }

        // defined fields to sort on

        APP.db.collection("fields").bulkWrite([{
            name: 'Id',
            type: 'string',
            key: 'id',
        }, {
            name: 'Created',
            type: 'date',
            key: 'createdAt',
            // }, {
            //     name: 'Last Modified',
            //     type: 'Date',
            //     key: 'lastModified',
        }].map(field => ({
            updateOne: {
                filter: { key: field.key },
                upsert: true,
                update: {
                    $set: field,
                }
            }
        })));

    } catch (err) {
        console.error(err)
    }

    console.log('-- completed connecting DB --');

    return APP;
}