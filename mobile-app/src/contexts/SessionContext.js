import axios from "axios";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import PatientRecord from "../classes/patient-record";
import findServer from "../utils/find-server";
import replace from "../utils/replace";

export const SERVER_PORT = 3333;
export const MAX_TRIES = 5;

const SessionContext = createContext({
    isConnected: false,
    loading: false,
    serverLoading: false,
    sessionInfo: {},
    sessionRecords: [],
    tryFindingServer: () => { },
    selectedStation: () => { },
    joinStation: () => { },
    leaveStation: () => { },
    getSessionInfo: () => { },
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
    const [sessionRecords, setSessionRecords] = useState([]);
    const patientRecords = useMemo(() => sessionRecords.map(record => new PatientRecord(record, sessionInfo.stations)), [sessionRecords, sessionInfo])
    const [selectedStationId, setSelectedStationId] = useState();
    const selectedStation = sessionInfo?.stations?.find(({ id }) => id === selectedStationId);



    useEffect(() => {
        console.log('Finding Server');
        tryFindingServer();
    }, []);

    useEffect(() => {
        console.log('socket changed')
        if (socket) {
            socket.auth = { username: `user ${Math.floor(Math.random() * 1000)}` };
            socket.on('connect', () => {
                console.log('Connected to server');
                socket.on('record-created', createdRecord => {
                    setSessionRecords(records => [...records, createdRecord]);
                });
                socket.on('record-updated', updatedRecord => {
                    setSessionRecords(records => {
                        const oldRecord = records.find(({ id }) => id === updatedRecord.id);
                        return oldRecord ?
                            replace(records, records.indexOf(oldRecord), updatedRecord)
                            :
                            records;
                    });
                });
                setIsConnected(true);
            });

            socket.on('disconnect', () => {
                console.log('Disconnected from server');
                socket.off('record-created');
                socket.off('record-updated');
                setIsConnected(false);
            });

            socket.connect();

            return () => {
                socket.off('connect');
                socket.off('disconnect');
                socket.off('record-created');
                socket.off('record-updated');
            };
        }
    }, [socket]);

    async function tryFindingServer() {
        // const serverIp = 'http://10.75.170.196:3333';
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

    async function getSessionInfo() {
        setLoading(true);
        if (socket) {
            console.log('Connecting to session');

            try {
                const url = `${serverIp}/api/v1/sessions/current`;
                const { data: { sessionInfo, sessionRecords = [] } = {} } = await axios.get(url, {
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache',
                        'Expires': '0',
                    },
                })
                // console.log({ sessionInfo, rest })
                if (sessionInfo) {
                    setSessionInfo(sessionInfo);
                    setSessionRecords(sessionRecords.map(record => new PatientRecord(record, sessionInfo.stations)));
                } else {
                    throw new Error('Session not started. Check server and try again.')
                }
                setLoading(false);

            } catch (error) {
                console.error(error);
                setLoading(false);
                throw new Error('Could not find session. Check server and try again');
            }
        } else {
            setLoading(false);
            throw new Error('Could not find server.')
        }
    }

    async function joinStation(stationId) {
        console.log('join station');
        setSelectedStationId(stationId);
        socket.emit('connect-to-station', { stationId });
    }

    async function leaveStation() {
        console.log('leave station');
        setSelectedStationId();
        socket.emit('disconnect-from-station');
    }

    async function disconnectFromSession() {
        console.log('Disconnecting from session...');
        socket.emit('disconnect-from-station');
        socket.off('session-info-update');
        setSessionInfo();
        setSessionRecords([]);
    }

    async function sendRecord(recordPayload) {
        console.log('Sending record...', recordPayload);
        const createRecord = !recordPayload.id;
        const createOrUpdate = createRecord ? 'create' : 'update';
        const url = `${serverIp}/api/v1/patients/${createOrUpdate}`;
        try {
            const result = await axios.post(url, recordPayload);
            // console.log({ result });
            return result.data.newId;
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <SessionContext.Provider
            value={{
                isConnected,
                serverIp,
                loading,
                sessionInfo,
                sessionRecords: patientRecords,
                selectedStation,
                serverLoading,
                tryFindingServer,
                joinStation,
                leaveStation,
                getSessionInfo,
                disconnectFromSession,
                sendRecord,
            }}
        >
            {children}
        </SessionContext.Provider>
    );
}