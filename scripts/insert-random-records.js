const { faker } = require('@faker-js/faker');
const axios = require('axios');

const SERVER_PORT = 3333;
const NUM_RECORDS_TO_INSERT = 5000;

const SCHOOLS = ['Vaisala', 'Salelologa', 'Auala'];
const VISION = ['20/20', '20/25', '20/30', '20/50'];
const REGION = "Orem";
const SESSION_ID = '6790423e87f3f08797a70b67';

async function main() {
    const url = `http://127.0.0.1:${SERVER_PORT}/api/v1/records`;

    const batchSize = 10;
    const batchCount = Math.ceil(NUM_RECORDS_TO_INSERT / batchSize);
    for (let i = 0; i < batchCount; i++) {
        const requests = Array.from({ length: batchSize }, () => axios.post(url, {
            record: {
                sessionId: SESSION_ID,
                region: REGION,
                name: faker.name.firstName() + ' ' + faker.name.lastName(),
                age: getRandomNumber({ min: 4, max: 18 }),
                school: SCHOOLS[Math.floor(Math.random() * SCHOOLS.length)],
                height: getRandomNumber({ min: 1, max: 2, precision: 2 }),
                weight: getRandomNumber({ min: 20, max: 100, precision: 1 }),
                vision: VISION[Math.floor(Math.random() * VISION.length)],
                bloodSugar: getRandomNumber({ min: 4, max: 10 }),
            },
            customData: { height: 'm', weight: 'kg', bloodSugar: 'HbA1c' },
        }));

        try {
            const results = await Promise.all(requests)
            // make sure none of them failed
            results.forEach(result => {
                if (result.status !== 200) {
                    console.error('Failed to insert record', result);
                }
            });
            
            console.log(`Inserted ${batchSize} records. Count at ${i * batchSize}`);
        } catch (error) {
            console.error(error);
        }
    }
}


function getRandomNumber({ min, max, precision = 0 }) {
    return +(Math.random() * (max - min) + min).toFixed(precision);
}

main();
