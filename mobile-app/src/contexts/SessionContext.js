import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import findServer from "../utils/find-server";
import promiseRace from "../utils/rase";

export const SERVER_PORT = 3333;
export const MAX_TRIES = 5;

const SessionContext = createContext({
    isConnected: false,
    loading: false,
    serverLoading: false,
    sessionInfo: {},
    tryFindingServer: () => { },
    selectedStation: () => { },
    setSelectedStationId: () => { },
    connectToSession: () => { },
    disconnectFromSession: () => { },
    sendRecord: () => { },
});

export const useSessionContext = () => useContext(SessionContext);

export default function SessionProvider({ children }) {

    // SERVER
    const [serverIp, setServerIp] = useState();
    const [socket, setSocket] = useState();
    const [isConnected, setIsConnected] = useState(false);
    const [serverLoading, setServerLoading] = useState(false);

    // SESSION
    const [loading, setLoading] = useState(false);
    const [sessionInfo, setSessionInfo] = useState();
    const [selectedStationId, setSelectedStationId] = useState();
    const selectedStation = sessionInfo?.stations?.find(({ id }) => id === selectedStationId);

    useEffect(() => {
        console.log('Finding Server');
        tryFindingServer();
    }, []);

    useEffect(() => {
        console.log('socket changed')
        if (socket) {
            socket.on('connect', () => {
                console.log('Connected to server');
                socket.on('session-info-update', newSessionInfo => {
                    console.log('session-info-update', newSessionInfo);
                    setSessionInfo(newSessionInfo);
                });
                setIsConnected(true);
            });

            socket.on('disconnect', () => {
                console.log('Disconnected from server');
                socket.off('session-info-update');
                setIsConnected(false);
            });

            socket.connect();

            return () => {
                socket.off('connect');
                socket.off('disconnect');
                socket.off('session-info-update');
            };
        }
    }, [socket]);

    async function tryFindingServer() {
        // const serverIp =  'http://10.75.179.46:3333';
        if (!isConnected) {
            setServerLoading(true);

            try {
                const serverIp = await findServer(SERVER_PORT, 'api/v1/server')
                if (serverIp) {
                    console.log(`Server found on: ${serverIp}`);
                    const socket = io(serverIp);
                    setServerIp(serverIp);
                    setSocket(socket);
                    setServerLoading(false);
                }
            } catch (error) {
                console.error(error);
                setServerLoading(false);
            }
        }
    }

    async function connectToSession() {
        setLoading(true);
        if (socket) {
            console.log('Connecting to session');
            return promiseRace([
                new Promise((res, rej) => socket.emit('connect-to-session', {}, sessionInfo => {
                    if (sessionInfo) {
                        setSessionInfo(sessionInfo)
                        res('Session Found')
                    }
                    rej('Unable to connect to session. Session not started.')
                }))
            ], 'Could not find server.')
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
            throw new Error('Could not find server.')
        }
    }

    async function disconnectFromSession() {
        console.log('Disconnecting from session...');
        socket.emit('disconnect-from-session');
        socket.off('session-info-update');
        setSessionInfo();
    }

    async function sendRecord(recordPayload) {
        console.log('Sending record...', recordPayload);
        const createRecord = !recordPayload._id;
        const createOrUpdate = createRecord ? 'create' : 'update';
        const url = `${serverIp}/api/v1/patients/${createOrUpdate}`;
        try {
            const result = await axios.post(url, recordPayload);
            console.log({ result });
            return result.data.newId;
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <SessionContext.Provider
            value={{
                isConnected,
                loading,
                sessionInfo,
                selectedStation,
                serverLoading,
                tryFindingServer,
                setSelectedStationId,
                connectToSession,
                disconnectFromSession,
                sendRecord,
            }}
        >
            {children}
        </SessionContext.Provider>
    );
}