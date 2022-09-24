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
                // sessions = db.collection('sessions');
                // patients = db.collection('patients');
                // customFields = db.collection('custom_fields');
            })
            .catch(console.error)
    },
    getDB: () => _db,
}

