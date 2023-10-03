import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import replace from "../utils/replace";
import { io } from "socket.io-client";
import LOG_TYPES from "../constants/log-types";
import { ALL_REQUIRED_STATION_FIELDS, REQUIRED_STATION_FIELDS } from "../constants/required-station-fields";
import axios from "axios";
import { serverURL } from "../constants/server";
import { LOG_LEVEL } from "../constants/log-levels";

export const socket = io(serverURL, {
    auth: { username: 'Computer', isAdmin: true }
});


const SessionContext = createContext({
    sessionIsRunning: false,
    sessionInfo: {},
    sessionRecords: [],
    getSessionList: () => { },
    getSessionTemplates: () => { },
    openSessionTemplate: () => { },
    saveSessionTemplate: () => { },
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

    const [sessionIsRunning, setSessionIsRunning] = useState(false);
    const [sessionId, setSessionId] = useState(null);

    const [sessionInfo, setSessionInfo] = useState(JSON.parse(localStorage.getItem(sessionInfoStorageKey)) || initialSystemInfo);
    const [sessionLogs, setSessionLogs] = useState([]);

    const [sessionRecords, setSessionRecords] = useState([]);

    const [connectedUsers, setConnectedUsers] = useState([]);

    const connectedUsersByStation = useMemo(() => connectedUsers.reduce((connectedUsersByStation, user) => ({
        ...connectedUsersByStation,
        [user.stationId]: [
            ...connectedUsersByStation[user.stationId] || [],
            user,
        ]
    }), {}), [connectedUsers]);


    useEffect(() => {
        if (sessionId !== null) {
            getSessionInfo(sessionId);
            getSessionRecords(sessionId);
        } else {
            setSessionRecords([]);
            setSessionLogs([]);
            setConnectedUsers([]);
        }
    }, [sessionId]);

    // Updates local storage when sessionInfo is updated
    useEffect(() => {
        localStorage.setItem(sessionInfoStorageKey, JSON.stringify(sessionInfo));
    }, [sessionInfo]);

    useEffect(() => {
        socket.on('connect', () => {
            // console.log('Connected to server');
            addSessionLog('You are connected to the session');

            socket.on('session-info', data => {
                console.log('session', data);
                const {
                    sessionIsRunning,
                    sessionId,
                } = data;

                setSessionIsRunning(sessionIsRunning);
                setSessionId(sessionId);
            });

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
            socket.on('station-join', data => {
                // console.log('station-join', data);
                addSessionLog(`User ${data.username} joined station ${data.stationId}`, LOG_TYPES.JOIN_STATION);
                setConnectedUsers(users => users.map(user => user.username === data.username ? {
                    ...user,
                    stationId: data.stationId,
                } : user));
            });
            socket.on('station-leave', data => {
                console.log('station-leave', data);
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
            socket.off('station-join');
            socket.off('station-leave');
            socket.off('user-connected');
            socket.off('user-disconnect');
            socket.off('users');
            socket.off('session');
            socket.off('record-created');
            socket.off('record-updated');
        });

        socket.connect();

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('station-join');
            socket.off('station-leave');
            socket.off('user-connected');
            socket.off('users');
            socket.off('session');
            socket.off('record-created');
            socket.off('record-updated');
        };
    }, []);

    function addSessionLog(log, type = LOG_TYPES.GENERAL) {
        setSessionLogs(logs => [
            ...logs.length > 500 ? logs.slice(1,) : logs,
            { log, type }
        ]);
    }

    function addStation() {
        setSessionInfo(sessionInfo => ({
            ...sessionInfo,
            stations: [...sessionInfo.stations, { name: `Station ${sessionInfo.stations.length + 1}`, id: sessionInfo.stations.length + 1, fields: [{ name: '', type: '' }] }]
        }));
    }

    function deleteStation(index) {
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

    function addField(stationIndex) {
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

    function updateField(stationIndex, fieldIndex, update) {
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

    function deleteField(stationIndex, fieldIndex) {
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

    async function getSessionInfo(sessionId) {
        try {
            const result = await axios.get(`${serverURL}/api/v1/sessions/${sessionId}`);
            console.log({ result });
            setSessionInfo(result.data);
        } catch (error) {
            console.error("Could not get session from server", error);
            window.api.writeLog(LOG_LEVEL.ERROR, `Could not get session from server: ${error}`);
        }
    }

    async function getSessionRecords(sessionId) {
        try {
            const result = await axios.get(`${serverURL}/api/v1/records`, { params: { find: { sessionId } } });
            console.log({ result });
            setSessionRecords(result.data);
        } catch (error) {
            console.error("Could not get records from server", error);
            window.api.writeLog(LOG_LEVEL.ERROR, `Could not get records from server: ${error}`);
        }
    }

    async function getSessionTemplates() {
        try {
            const result = await axios.get(`${serverURL}/api/v1/sessionsTemplates`);
            console.log({ result })
            return result.data;
        } catch (error) {
            console.error("Could not get session template list from server.", error);
            window.api.writeLog(LOG_LEVEL.ERROR, `Could not get session template list from server: ${error}`);
        }
    }

    function openSessionTemplate(template) {
        const {
            sessionInfo,
        } = template;
        setSessionInfo(sessionInfo);
    }

    async function saveSessionTemplate(templateInfo) {
        const template = {
            ...templateInfo,
            sessionInfo,
        };
        try {
            await axios.post(`${serverURL}/api/v1/sessionsTemplates`, template);
        } catch (error) {
            console.error("Could not save session template.", error);
            window.api.writeLog(LOG_LEVEL.ERROR, `Could not save session template: ${error}`);

        }
    }

    async function getSessionList() {
        try {
            const result = await axios.get(`${serverURL}/api/v1/sessions/${sessionId}`);
            return result.data;
        } catch (error) {
            console.error("Could not get session list from server.", error);
            window.api.writeLog(LOG_LEVEL.ERROR, `Could not get session list from server: ${error}`);

        }
    }

    async function startSession(sessionId) {
        const sessionData = {
            sessionId,
            ...sessionInfo,
            stations: sessionInfo.stations.map((station, i) => ({
                ...station,
                fields: i === 0 ?
                    [
                        ...ALL_REQUIRED_STATION_FIELDS,
                        ...station.fields,
                    ]
                    :
                    station.fields
            })),
        };

        socket.emit("session-start", sessionData);
    }

    function stopSession() {
        socket.emit("session-stop");
    }

    return (
        <SessionContext.Provider
            value={{
                sessionIsRunning,
                sessionInfo,
                sessionLogs,
                connectedUsersByStation,
                sessionRecords,
                getSessionList,
                getSessionTemplates,
                openSessionTemplate,
                saveSessionTemplate,
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