import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import promiseRace from "../utils/rase";
const socket = io('http://192.168.86.231:3333');

const SessionContext = createContext({
    session: {},
    connectToSession: () => { },
    disconnectFromSession: () => { },
    sendRecord: () => { },
});

export const useSessionContext = () => useContext(SessionContext);

export default function SessionProvider({ children }) {

    const [isConnected, setIsConnected] = useState(socket.connected);
    const [sessionInfo, setSessionInfo] = useState();

    useEffect(() => {
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
    }, []);

    async function connectToSession() {
        console.log('Connecting to session');
        socket.connect();
        return promiseRace([
            new Promise((res, rej) => socket.emit('session connect', sessionInfo => {
                if (sessionInfo) {
                    setSessionInfo(sessionInfo)
                    res('Session Found')
                }
                rej('Error: Unable to connect to session - session not started.')
            }))
        ], 'Error. Could not find server.');
    }

    async function disconnectFromSession() {
        console.log('Disconnection from session...');
        // socket.disconnect();
    }

    async function sendRecord(recordPayload) {
        console.log('Sending record...');
        socket.emit("update-record", recordPayload);

    }

    return (
        <SessionContext.Provider
            value={{
                isConnected,
                sessionInfo,
                connectToSession,
                disconnectFromSession,
                sendRecord,
            }}
        >
            {children}
        </SessionContext.Provider>
    );
}