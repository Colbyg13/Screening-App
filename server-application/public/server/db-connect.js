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
        const lastRecord = APP.db.collection('latestRecordID');
        const result = await lastRecord.countDocuments();
        console.log("RESULT", result, typeof (result));
        if (result === 0) lastRecord.insertOne({ latestID: 1 });
    } catch (err) {
        console.error(err)
    }

    console.log('-- completed connecting DB --');

    return APP;
}