import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import findServer, { PREVIOUS_CONNECTION_STORAGE_KEY } from "../utils/find-server";

export const SERVER_PORT = 3333;

const ServerContext = createContext({
    serverIp: '',
    serverLoading: false,
    tryFindingServer: () => { },
});

export const useServerContext = () => useContext(ServerContext);

export default function ServerProvider({ children }) {

    const [serverLoading, setServerLoading] = useState(false);
    const [serverIp, setServerIp] = useState();

    useEffect(() => {
        tryFindingServer();
    }, []);


    async function tryFindingServer(ipAddress) {
        setServerLoading(true);
        try {
            const serverIp = ipAddress ? `http://${ipAddress}:3333` : await findServer(SERVER_PORT, 'api/v1/server')
            if (serverIp) {
                AsyncStorage.setItem(PREVIOUS_CONNECTION_STORAGE_KEY, serverIp);
                console.log(`Server found on: ${serverIp}`);
                setServerIp(serverIp);
            }
        } catch (error) {
            console.warn(error);
        } finally {
            setServerLoading(false);
        }
    }

    return (
        <ServerContext.Provider
            value={{
                serverIp,
                serverLoading,
                tryFindingServer,
            }}
        >
            {children}
        </ServerContext.Provider>
    );
}