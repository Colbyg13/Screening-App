const express = require('express');
const router = express.Router();
const { database } = require('../database/db');
const { LOG_LEVEL, writeLog } = require('../utils/logger');
const { ObjectId } = require('mongodb');

router.get('/', async (req, res) => {
    try {
        const dataTypesCol = database.collection('customDataTypes');
        const customData = await dataTypesCol.find().toArray();

        res.status(200).json(customData);
    } catch (error) {
        writeLog(LOG_LEVEL.ERROR, `Error getting custom data types ${error}`);
        res.status(500).json({
            error: 'Could not get custom data types due to Internal Server Error',
        });
    }
});

router.post('/', async (req, res) => {

    const {
        body: { customDataTypes, dataTypeIdsToDelete },
    } = req;

    try {
        const dataTypesCol = database.collection('customDataTypes');
        await dataTypesCol.bulkWrite([
            ...customDataTypes.map(({ _id, ...dataType }) => ({
                updateOne: {
                    filter: { _id: new ObjectId(_id) },
                    upsert: true,
                    update: {
                        $set: dataType,
                    },
                },
            })),
            ...dataTypeIdsToDelete.map(_id => ({
                deleteOne: {
                    filter: { _id: new ObjectId(_id) },
                },
            })),
        ]);

        res.status(200).json({ message: 'Success' });
    } catch (error) {
        writeLog(LOG_LEVEL.ERROR, `Error getting custom data types ${error}`);
        res.status(500).json({
            error: 'Could not get custom data types due to Internal Server Error',
        });
    }
});

module.exports = router;
