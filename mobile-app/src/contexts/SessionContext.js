import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import findServer from "../utils/find-server";
import promiseRace from "../utils/rase";
const SERVER_PORT = 3333;
let socket;

const SessionContext = createContext({
    session: {},
    connectToSession: () => { },
    disconnectFromSession: () => { },
    sendRecord: () => { },
});

export const useSessionContext = () => useContext(SessionContext);

export default function SessionProvider({ children }) {

    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(false);
    const [sessionInfo, setSessionInfo] = useState();
    const [selectedStationId, setSelectedStationId] = useState();
    const selectedStation = sessionInfo?.stations?.find(({id}) => id === selectedStationId);

    useEffect(() => {
        console.log('Finding Server')
        tryFindingServer()
            .then(ipAddress => {
                socket = io(ipAddress);
            })
    }, [])


    useEffect(() => {
        console.log('socket changed')
        if (socket) {
            socket.on('connect', () => {
                console.log('CONNECTED')
                setIsConnected(true);
            });

            socket.on('disconnect', () => {
                console.log('DISCONNECTED')
                setIsConnected(false);
            });

            return () => {
                socket.off('connect');
                socket.off('disconnect');
            };
        }
    }, [socket]);

    async function connectToSession() {
        setLoading(true);
        if (socket) {
            console.log('Connecting to session');
            socket.connect();
            return promiseRace([
                new Promise((res, rej) => socket.emit('session connect', sessionInfo => {
                    if (sessionInfo) {
                        setSessionInfo(sessionInfo)
                        res('Session Found')
                        socket.on('session-info-update', newSessionInfo => {
                            console.log('session-info-update', newSessionInfo);
                            setSessionInfo(newSessionInfo);
                        })
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
        // socket.disconnect();
    }

    async function sendRecord(recordPayload) {
        console.log('Sending record...', recordPayload);
        socket.emit("update-record", recordPayload)
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

let tries = 0;

async function tryFindingServer() {
    try {
        const serverIp = await findServer(SERVER_PORT)
        return serverIp;
    } catch (error) {
        // console.error({ error })
        setTimeout(() => {
            if (tries++ < 20) tryFindingServer()
        }, 5000);
    }
}