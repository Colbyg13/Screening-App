const { faker } = require('@faker-js/faker');
const axios = require('axios');
const ip = require('ip');

const SERVER_PORT = 3333;
const NUM_RECORDS_TO_INSERT = 5000;

function main() {
    
    const url = `http://${ip.address()}:${SERVER_PORT}/api/v1/patients/create`;
    // const url = 'http://192.168.86.245:3333/api/v1/patients/create';

    Promise.all(Array(NUM_RECORDS_TO_INSERT).fill().map(() => axios.post(url, {
        name: `${faker.name.firstName()} ${faker.name.lastName()}`,
        dob: new Date(Date.now() - 200_000_000_000 - Math.floor(Math.random() * 100_000_000_000)).toLocaleDateString(),
        gender: Math.random() < 0.5 ? 'Male' : 'Female',
        adult: Math.random() < 0.5,
        weight: ~~(Math.random() * 100) + 80,
        height: ~~(Math.random() * 4 * 10) / 10 + 3,
        heartMurmur: Math.random() < 0.5,
        eyes: Math.random() < 0.5 ? '20/20' : '20/50',
    })))
    .then(() => console.log('created'))
    .catch(err => {
        console.error(err)
    })
}

main();