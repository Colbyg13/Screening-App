import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as Network from 'expo-network';

export const PREVIOUS_CONNECTION_STORAGE_KEY = 'previous-connection';

export default async function findServer(port, path = '') {
    // Check previous connected ip
    const previousIp = await AsyncStorage.getItem(PREVIOUS_CONNECTION_STORAGE_KEY);
    // Manually goes through all the ip addresses (with subnet /24 - will need to update if differs)
    return new Promise((res, rej) =>
        Network.getIpAddressAsync().then(ipAddress =>
            Promise.allSettled([
                ...(previousIp
                    ? [axios.get(`http://${previousIp}:${port}/${path}`, { timeout: 1000 })]
                    : []),
                ...Array(256)
                    .fill()
                    .map((_, i) => {
                        const updatedIp = ipAddress.replace(/^(\d+\.\d+\.\d+).*$/, `$1.${i}`);
                        const fullIp = `http://${updatedIp}:${port}/${path}`;
                        return axios.get(fullIp, { timeout: 1000 });
                    }),
            ])
                .then(results => results.filter(({ status }) => status === 'fulfilled'))
                .then(([{ value: { config: { url = '' } = {} } = {} } = {}] = []) => {
                    if (url) res(url.replace(/^(.*\d+\.\d+\.\d+\.\d+:\d+).*$/, '$1'));

                    rej('No server found');
                })
                .catch(e => {
                    console.warn(e);
                    rej(e);
                }),
        ),
    );
}
