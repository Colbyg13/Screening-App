import axios from "axios";
import * as Network from 'expo-network';

export default async function findServer(port, path = '') {
    // Manually goes through all the ip addresses (with subnet /24 - will need to update if differs)
    return new Promise((res, rej) => Network.getIpAddressAsync().then(ipAddress => Promise.allSettled([
        ...Array(256).fill().map((_, i) => {
            const updatedIp = ipAddress.replace(/^(\d+\.\d+\.\d+).*$/, `$1.${i}`);
            const fullIp = `http://${updatedIp}:${port}/${path}`
            return axios.get(fullIp, { timeout: 3000 })
        }),
    ])
        .then(results => results.filter(({ status }) => status === 'fulfilled'))
        .then(([{ value: { config: { url = '' } = {} } = {} } = {}] = []) => {
            if (url) res(url.replace(/^(.*\d+\.\d+\.\d+\.\d+:\d+).*$/, '$1'))

            rej('No server found')
        })
        .catch(e => {
            console.error(e);
            rej(e);
        })
    ))
}