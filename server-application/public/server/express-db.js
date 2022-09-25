const { MongoClient } = require("mongodb");
const url = 'mongodb://127.0.0.1:27017';

const DB_NAME = 'screening_app';
let _db;

module.exports = {
    connectToDatabase: () => {
        MongoClient.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
            .then(client => {
                _db = client.db(DB_NAME);
                console.log("Connected to DB", DB_NAME)
                const lastRecord = _db.collection('latestRecordID');
                lastRecord.countDocuments()
                .then(result => {
                    console.log("RESULT", result, typeof(result));
                    if(result === 0) {
                        lastRecord.insertOne({latestID: 1})
                    }
                    else return; //no need to insert counter document
                })
                
                // sessions = db.collection('sessions');
                // patients = db.collection('patients');
                // customFields = db.collection('custom_fields');
            })
            .catch(console.error)
    },
    getDB: () => _db,
}

