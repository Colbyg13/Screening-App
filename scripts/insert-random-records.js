const { faker } = require('@faker-js/faker');
const axios = require('axios');

const SERVER_PORT = 3333;
const NUM_RECORDS_TO_INSERT = 500;

function main() {
    
    const url = `http://127.0.0.1:${SERVER_PORT}/api/v1/patients/create`;

    Promise.all(Array(NUM_RECORDS_TO_INSERT).fill().map(() => axios.post(url, {
        record: {
            name: `${faker.name.firstName()} ${faker.name.lastName()}`,
            // gender: Math.random() < 0.5 ? 'Male' : 'Female',
            // adult: Math.random() < 0.5,
            village: faker.address.cityName(),
            weight: ~~(Math.random() * 100) + 80,
            height: ~~(Math.random() * 4 * 10) / 10 + 3,
            // heartMurmur: Math.random() < 0.5,
            eyes: Math.random() < 0.5 ? '20/20' : '20/50',
        },
        customData: {
            height: 'cm',
            weight: 'kg',
        }
    })))
    .then(() => console.log('created'))
    .catch(err => {
        console.error(err)
    })
}

main();