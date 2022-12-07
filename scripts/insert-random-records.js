const { faker } = require('@faker-js/faker');
const axios = require('axios');

const SERVER_PORT = 3333;
const NUM_RECORDS_TO_INSERT = 4616;

const SCHOOLS = ['Vaisala', 'Salelologa', 'Auala'];
const EYES = ['20/20', '20/25', '20/30', '20/40', '20/50', '20/70', '20/100'];

function main() {

    const url = `http://127.0.0.1:${SERVER_PORT}/api/v1/patients/create`;

    Promise.all(Array(NUM_RECORDS_TO_INSERT).fill().map(() => axios.post(url, {
        record: {
            name: `${faker.name.firstName()} ${faker.name.lastName()}`,
            age: faker.datatype.number({ min: 5, max: 15 }),
            school: SCHOOLS[Math.floor(Math.random() * SCHOOLS.length)],
            weight: faker.datatype.number({ min: 22, max: 68 }),
            height: faker.datatype.number({ min: 22, max: 68 }),
            glucose: faker.datatype.number({ min: 20, max: 119 }),
            eyes: EYES[Math.floor(Math.random() * EYES.length)],
        },
        customData: {
            height: 'cm',
            weight: 'kg',
            glucose: 'mmol/mol',
        }
    })))
        .then(() => console.log('created'))
        .catch(err => {
            console.error(err)
        })
}

main();