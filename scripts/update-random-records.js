const { faker } = require('@faker-js/faker');
const axios = require('axios');

const SERVER_PORT = 3333;

const SCHOOLS = ['Vaisala', 'Salelologa', 'Auala'];
const VISION = ['20/20', '20/25', '20/30', '20/50'];
const SESSION_ID = '6790423e87f3f08797a70b67';

async function main() {
    const url = `http://127.0.0.1:${SERVER_PORT}/api/v1/records`;

    while (true) {
        try {
            const response = await axios.get(url, { params: { sessionId: SESSION_ID } });
            if (response.status === 200) {
                const randomRecord = response.data[Math.floor(Math.random() * response.data.length)];

                await axios.post(url, {
                    record: {
                        ...randomRecord,
                        name: faker.name.firstName() + ' ' + faker.name.lastName(),
                        age: getRandomNumber({ min: 4, max: 18 }),
                        school: SCHOOLS[Math.floor(Math.random() * SCHOOLS.length)],
                        height: getRandomNumber({ min: 1, max: 2, precision: 2 }),
                        weight: getRandomNumber({ min: 20, max: 100, precision: 1 }),
                        vision: VISION[Math.floor(Math.random() * VISION.length)],
                        bloodSugar: getRandomNumber({ min: 4, max: 10 }),
                    },
                    customData: { height: 'm', weight: 'kg', bloodSugar: 'HbA1c' },
                });

                console.log('updated record', randomRecord.id);
            }

        } catch (error) {
            console.error('Server not ready, waiting 5 seconds');
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}


function getRandomNumber({ min, max, precision = 0 }) {
    return +(Math.random() * (max - min) + min).toFixed(precision);
}

main();
