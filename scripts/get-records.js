const axios = require('axios');

const SERVER_PORT = 3333;

function main() {
    const url = `http://127.0.0.1:${SERVER_PORT}/api/v1/records`;

    axios.get(url)
        .then((results) => console.log(results.data))
        .catch(err => {
            console.error(err);
        });
}

main();
