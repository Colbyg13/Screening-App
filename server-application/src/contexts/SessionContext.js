import { createContext, useContext, useEffect, useState } from "react";
import replace from "../utils/replace";

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
        name: '',
        type: '',
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

    const [sessionRecords, setSessionRecords] = useState([]);

    // Updates local storage when sessionInfo is updated
    useEffect(() => {
        localStorage.setItem(sessionInfoStorageKey, JSON.stringify(sessionInfo));
    }, [sessionInfo]);

    const addStation = () => setSessionInfo(sessionInfo => ({
        ...sessionInfo,
        stations: [...sessionInfo.stations, { name: `Station ${sessionInfo.stations.length + 1}`, fields: [{ name: '', type: '' }] }]
    }));

    const deleteStation = index => setSessionInfo(sessionInfo => ({
        ...sessionInfo,
        stations: sessionInfo.stations
            .filter((_, i) => i !== index)
            .map((station, i) => ({
                ...station,
                name: `Station ${i + 1}`
            })),
    }));

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

    function startSession() {
        // TODO: get current session records for initial state based on generalInformation and date?
        // const sessionRecords = await getRecordsFromDB() // Make sure to pass in this value down below
        const response = window.api.startSession(sessionInfo);
        console.log({ response });
        setSessionIsRunning(true);
        // setSessionRecords(sessionRecords);
    }

    function stopSession() {
        const response = window.api.stopSession();
        console.log({ response });
        setSessionIsRunning(false);
    }

    return (
        <SessionContext.Provider
            value={{
                sessionIsRunning,
                sessionInfo,
                sessionRecords,
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