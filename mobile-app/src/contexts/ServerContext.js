import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as Network from 'expo-network';
import axios from 'axios';

const SERVER_PORT = 3333;
const SEVER_PATH = 'api/v1/server';
const PREVIOUS_CONNECTION_STORAGE_KEY = 'previous-connection';
const TIMEOUT = 1000;
const MAX_CONCURRENT_REQUESTS = 50;

const ServerContext = createContext({
    serverIp: '',
    serverURL: '',
    findingServers: false,
    availableServerIps: [],
    findServer: () => {},
    connectToServer: () => {},
    disconnectFromServer: () => {},
});

export const useServerContext = () => useContext(ServerContext);

export default function ServerProvider({ children }) {
    const [findingServers, setFindingServers] = useState(false);
    const [serverIp, setServerIp] = useState();
    const [availableServerIps, setAvailableServerIps] = useState([]);
    const serverURL = useMemo(() => `http://${serverIp}:${SERVER_PORT}`, [serverIp]);

    const connectToServer = useCallback(setServerIp, [setServerIp]);
    const disconnectFromServer = useCallback(() => setServerIp(), [setServerIp]);

    useEffect(() => {
        getPreviousIP();
        findServer();
    }, []);

    useEffect(() => {
        if (serverIp) {
            AsyncStorage.setItem(PREVIOUS_CONNECTION_STORAGE_KEY, serverIp);
        }
    }, [serverIp]);

    async function getPreviousIP() {
        const previousIp = await AsyncStorage.getItem(PREVIOUS_CONNECTION_STORAGE_KEY);
        if (previousIp) {
            setServerIp(previousIp);
        }
    }

    async function findServer() {
        setFindingServers(true);

        // Scan subnet if no previous server found
        const ipAddress = await Network.getIpAddressAsync();
        const ipRange = generateSubnetIps(ipAddress);
        await scanSubnet(ipRange, SERVER_PORT, SEVER_PATH);

        setFindingServers(false);
    }

    async function tryConnect(ip, port, path) {
        try {
            const url = `http://${ip}:${port}/${path}`;
            const response = await axios.get(url, { timeout: TIMEOUT });
            const foundServerIp = formatServerUrl(response.config.url);
            setAvailableServerIps(serverIps =>
                serverIps.includes(foundServerIp) ? serverIps : [...serverIps, foundServerIp],
            );
        } catch {
            return;
        }
    }

    function generateSubnetIps(baseIp) {
        const subnet = baseIp.replace(/^(\d+\.\d+\.\d+)\.\d+$/, '$1');
        return Array.from({ length: 256 }, (_, i) => `${subnet}.${i}`);
    }

    async function scanIpsBatch(ipBatch, port, path) {
        const connectionPromises = ipBatch.map(ip => tryConnect(ip, port, path));
        await Promise.allSettled(connectionPromises);
    }

    async function scanSubnet(ipRange, port, path) {
        const allServers = [];

        for (let i = 0; i < ipRange.length; i += MAX_CONCURRENT_REQUESTS) {
            const ipBatch = ipRange.slice(i, i + MAX_CONCURRENT_REQUESTS);
            await scanIpsBatch(ipBatch, port, path);
        }

        return allServers;
    }

    function formatServerUrl(url) {
        const ipPattern = /\b(?:\d{1,3}\.){3}\d{1,3}\b/;
        const ipAddress = url.match(ipPattern);
        return ipAddress[0];
    }

    return (
        <ServerContext.Provider
            value={{
                serverIp,
                serverURL,
                findingServers,
                availableServerIps,
                findServer,
                connectToServer,
                disconnectFromServer,
            }}
        >
            {children}
        </ServerContext.Provider>
    );
}
