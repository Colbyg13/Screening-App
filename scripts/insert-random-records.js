const { faker } = require('@faker-js/faker');
const axios = require('axios');

const NUM_RECORDS_TO_INSERT = 100;

function main() {

    const url = 'http://10.75.167.148:3333/api/v1/patients/create';

    Promise.all(Array(NUM_RECORDS_TO_INSERT).fill().map(() => axios.post(url, {
        name: faker.name.firstName(),
        dob: new Date().toLocaleDateString(),
        gender: Math.random() < 0.5 ? 'male' : 'female',
        adult: Math.random() < 0.5 ? true : false,
        weight: ~~(Math.random() * 100) + 80,
        height: ~~(Math.random() * 4) + 3,
        eyes: Math.random() < 0.5 ? '20/20' : '20/50',
    })))
    .then(() => console.log('created'))
    .catch(err => {
        console.error(err)
    })
}

main();