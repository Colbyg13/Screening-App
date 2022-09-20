import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import findServer from "../utils/find-server";
import promiseRace from "../utils/rase";

export const SERVER_PORT = 3333;
export const MAX_TRIES = 20;

const SessionContext = createContext({
    isConnected: false,
    loading: false,
    sessionInfo: {},
    selectedStation: () => { },
    setSelectedStationId: () => { },
    connectToSession: () => { },
    disconnectFromSession: () => { },
    sendRecord: () => { },
});

export const useSessionContext = () => useContext(SessionContext);

export default function SessionProvider({ children }) {

    // Connected to server
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(false);
    const [sessionInfo, setSessionInfo] = useState();
    const [selectedStationId, setSelectedStationId] = useState();
    const selectedStation = sessionInfo?.stations?.find(({ id }) => id === selectedStationId);
    const [socket, setSocket] = useState();

    useEffect(() => {
        console.log('Finding Server')
        tryFindingServer()
            .then(ipAddress => {
                console.log('server found', ipAddress)
                const socket = io(ipAddress);
                setSocket(socket);
            })
    }, [])


    useEffect(() => {
        console.log('socket changed')
        if (socket) {
            socket.on('connect', () => {
                console.log('CONNECTED')
                socket.on('session-info-update', newSessionInfo => {
                    console.log('session-info-update', newSessionInfo);
                    setSessionInfo(newSessionInfo);
                })
                setIsConnected(true);
            });

            socket.on('disconnect', () => {
                console.log('DISCONNECTED')
                socket.off('session-info-update');
                setIsConnected(false);
            });

            console.log('socket.connect()')
            socket.connect();

            return () => {
                socket.off('connect');
                socket.off('disconnect');
                socket.off('session-info-update');
            };
        }
    }, [socket]);

    async function connectToSession() {
        setLoading(true);
        if (socket) {
            console.log('Connecting to session');
            return promiseRace([
                new Promise((res, rej) => socket.emit('session connect', sessionInfo => {
                    if (sessionInfo) {
                        setSessionInfo(sessionInfo)
                        res('Session Found')
                    }
                    rej('Error: Unable to connect to session - session not started.')
                }))
            ], 'Error. Could not find server.')
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
            throw new Error('Could not find server')
        }
    }

    async function disconnectFromSession() {
        console.log('Disconnection from session...');
        socket.off('session-info-update');
        setSessionInfo();
    }

    async function sendRecord(recordPayload) {
        console.log('Sending record...', recordPayload);
        socket.emit("update-record", recordPayload);
    }

    return (
        <SessionContext.Provider
            value={{
                isConnected,
                loading,
                sessionInfo,
                selectedStation,
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

async function tryFindingServer(tries = 0) {
    try {
        const serverIp = await findServer(SERVER_PORT)
        return serverIp;
    } catch (error) {
        // console.error({ error })
        setTimeout(() => {
            if (tries < MAX_TRIES) tryFindingServer(tries + 1)
        }, 5000);
    }
}