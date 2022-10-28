import { createContext, useContext, useEffect, useMemo, useState } from "react";
import replace from "../utils/replace";
import { io } from "socket.io-client";
import LOG_TYPES from "../constants/log-types";
import { ALL_REQUIRED_STATION_FIELDS, REQUIRED_STATION_FIELDS } from "../constants/required-station-fields";

export const SERVER_PORT = 3333;

const SessionContext = createContext({
    sessionIsRunning: false,
    sessionInfo: {},
    sessionRecords: [],
    startSession: () => { },
    stopSession: () => { },
    addStation: () => { },
    deleteStation: () => { },
    addField: () => { },
    updateField: () => { },
    deleteField: () => { },
});

export const useSessionContext = () => useContext(SessionContext);

const sessionInfoStorageKey = 'sessionInfo';

const initialSystemInfo = {
    generalFields: [{
        name: '',
        value: '',
    }],
    stations: [{
        id: 1,
        name: 'Station 1',
        fields: [{
            name: '',
            type: '',
        }]
    }],
}

export default function SessionProvider({ children }) {

    /**
     * Allows our application to see if we are currently in a session.
     * The user should be able to use the whole application while the session is going
     * (it should not cut the session when the view leaves)
     */

    // // TODO: implement this later
    // let offlineRecordId = 0;

    const [sessionIsRunning, setSessionIsRunning] = useState(window.api.getIsSessionRunning());

    const [sessionInfo, setSessionInfo] = useState(JSON.parse(localStorage.getItem(sessionInfoStorageKey)) || initialSystemInfo);
    const [sessionLogs, setSessionLogs] = useState([]);
    const addSessionLog = (log, type = LOG_TYPES.GENERAL) => setSessionLogs(logs => [...logs, { log, type }]);
    const [sessionRecords, setSessionRecords] = useState([]);
    const [connectedUsers, setConnectedUsers] = useState([]);
    const connectedUsersByStation = useMemo(() => connectedUsers.reduce((connectedUsersByStation, user) => ({
        ...connectedUsersByStation,
        [user.stationId]: [
            ...connectedUsersByStation[user.stationId] || [],
            user,
        ]
    }), {}), [connectedUsers]);

    // Updates local storage when sessionInfo is updated
    useEffect(() => {
        localStorage.setItem(sessionInfoStorageKey, JSON.stringify(sessionInfo));
    }, [sessionInfo]);

    useEffect(() => {
        if (sessionIsRunning) {
            const socket = io(`http://127.0.0.1:${SERVER_PORT}`);
            socket.auth = { username: 'Admin', isAdmin: true }
            socket.on('connect', () => {
                // console.log('Connected to server');
                addSessionLog('You are connected to the session');

                socket.on('record-created', createdRecord => {
                    addSessionLog(`record created with id: ${createdRecord.id}, name: ${createdRecord.name}, dob: ${createdRecord.dob}`, LOG_TYPES.RECORD_CREATED);
                    setSessionRecords((records = []) => [...records, createdRecord]);
                });
                socket.on('record-updated', updatedRecord => {
                    addSessionLog(`updated record id: ${updatedRecord.id}`, LOG_TYPES.RECORD_UPDATED);
                    setSessionRecords(records => {
                        const oldRecord = records.find(({ id }) => id === updatedRecord.id);
                        return replace(records, records.indexOf(oldRecord), updatedRecord);
                    });
                });
                socket.on('join-station', data => {
                    // console.log('join-station', data);
                    addSessionLog(`User ${data.username} joined station ${data.stationId}`, LOG_TYPES.JOIN_STATION);
                    setConnectedUsers(users => users.map(user => user.username === data.username ? {
                        ...user,
                        stationId: data.stationId,
                    } : user));
                });
                socket.on('leave-station', data => {
                    console.log('leave-station', data);
                    addSessionLog(`User ${data.username} left their station`, LOG_TYPES.LEAVE_STATION);
                    setConnectedUsers(users => users.map(user => user.username === data.username ? {
                        ...user,
                        stationId: undefined,
                    } : user));
                });
                socket.on('user-connected', newUser => {
                    addSessionLog(`User ${newUser.username} connected to server`, LOG_TYPES.CONNECTED);
                    console.log('user-connected', newUser);
                    setConnectedUsers(users => [...users, newUser])
                });
                socket.on('user-disconnect', user => {
                    addSessionLog(`User ${user.username} disconnected server`, LOG_TYPES.DISCONNECTED);
                    console.log('user-disconnect', user);
                    setConnectedUsers(users => users.filter(({ username }) => user.username !== username))
                });
                socket.on('users', data => {
                    console.log('users', data);
                    setConnectedUsers(data);
                });
            });

            socket.on('disconnect', () => {
                console.log('Disconnected from server');
                socket.off('join-station');
                socket.off('leave-station');
                socket.off('user-connected');
                socket.off('user-disconnect');
                socket.off('users');
                socket.off('record-created');
                socket.off('record-updated');
            });

            socket.connect();

            return () => {
                socket.off('connect');
                socket.off('disconnect');
                socket.off('join-station');
                socket.off('leave-station');
                socket.off('user-connected');
                socket.off('users');
                socket.off('record-created');
                socket.off('record-updated');
            };
        }
    }, [sessionIsRunning])


    const addStation = () => setSessionInfo(sessionInfo => ({
        ...sessionInfo,
        stations: [...sessionInfo.stations, { name: `Station ${sessionInfo.stations.length + 1}`, id: sessionInfo.stations.length + 1, fields: [{ name: '', type: '' }] }]
    }));

    const deleteStation = index => {
        //General Fields
        if (index === undefined) throw new Error('Cannot delete general fields');

        //Stations
        else setSessionInfo(sessionInfo => ({
            ...sessionInfo,
            stations: sessionInfo.stations
                .filter((_, i) => i !== index)
                .map((station, i) => ({
                    ...station,
                    id: i + 1,
                    name: `Station ${i + 1}`
                })),
        }));
    }

    const addField = stationIndex => {
        // General Field
        if (stationIndex === undefined) setSessionInfo(sessionInfo => ({
            ...sessionInfo,
            generalFields: [...sessionInfo.generalFields, { name: '', value: '' }]
        }));

        // Station Field
        else setSessionInfo(sessionInfo => ({
            ...sessionInfo,
            stations: replace(sessionInfo.stations, stationIndex, {
                ...sessionInfo.stations[stationIndex],
                fields: [...sessionInfo.stations[stationIndex].fields, { name: '', type: '' }]
            })
        }));
    }

    const updateField = (stationIndex, fieldIndex, update) => {
        // General Field
        if (stationIndex === undefined) setSessionInfo(sessionInfo => ({
            ...sessionInfo,
            generalFields: replace(sessionInfo.generalFields, fieldIndex, update),
        }))

        // Station Field
        else setSessionInfo(sessionInfo => ({
            ...sessionInfo,
            stations: replace(sessionInfo.stations, stationIndex, {
                ...sessionInfo.stations[stationIndex],
                fields: replace(sessionInfo.stations[stationIndex].fields, fieldIndex, update),
            })
        }));
    }

    const deleteField = (stationIndex, fieldIndex) => {
        if (stationIndex === undefined) setSessionInfo(sessionInfo => ({
            ...sessionInfo,
            generalFields: sessionInfo.generalFields.filter((_, i) => fieldIndex !== i),
        }))

        else setSessionInfo(sessionInfo => ({
            ...sessionInfo,
            stations: replace(sessionInfo.stations, stationIndex, {
                ...sessionInfo.stations[stationIndex],
                fields: sessionInfo.stations[stationIndex].fields.filter((_, i) => i !== fieldIndex),
            })
        }));
    }

    const getSessionList = async () => {
        try {
            const response = await window.api.getSessionList();
            return response;
        } catch (err) {
            console.error(err)
        }
    }

    const startSession = async (sessionId) => {
        try {
            const response = await window.api.startSession({
                ...sessionInfo,
                stations: sessionInfo.stations.map((station, i) => ({
                    ...station,
                    fields: i ?
                        station.fields
                        :
                        [
                            ...ALL_REQUIRED_STATION_FIELDS,
                            ...station.fields,
                        ]
                })),
                id: sessionId,
            });
            console.log({ response })
            const {
                sessionRecords: newSessionRecords,
                sessionInfo: newSessionInfo,
            } = response;

            // filtering out required fields
            setSessionInfo({
                ...newSessionInfo,
                stations: newSessionInfo.stations.map(station => ({
                    ...station,
                    fields: station.fields.filter(f => !REQUIRED_STATION_FIELDS[f.key])
                })),
            });
            setSessionRecords(newSessionRecords);
            setSessionIsRunning(window.api.getIsSessionRunning());
        } catch (err) {
            console.error(err)
            setSessionIsRunning(window.api.getIsSessionRunning());
        }
    }

    const stopSession = () => {
        window.api.stopSession();
        setSessionIsRunning(window.api.getIsSessionRunning());
        setSessionLogs([]);
        setSessionRecords([]);
    }

    return (
        <SessionContext.Provider
            value={{
                sessionIsRunning,
                sessionInfo,
                sessionLogs,
                connectedUsers,
                connectedUsersByStation,
                sessionRecords,
                getSessionList,
                startSession,
                stopSession,
                addStation,
                deleteStation,
                addField,
                updateField,
                deleteField,
            }}
        >
            {children}
        </SessionContext.Provider>
    );
}