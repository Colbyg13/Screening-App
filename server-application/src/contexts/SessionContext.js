import { createContext, useContext, useState } from "react";
import replace from "../utils/replace";

const SessionContext = createContext({
    sessionIsRunning: false,
    generalFields: {},
    stations: [],
    sessionRecords: [],
    createOrUpdateRecord: () => { },
    startSession: () => { },
    stopSession: () => { },
});

export const useSessionContext = () => useContext(SessionContext);


const testGeneralFields = [{
    name: 'Village',
    value: 'UVU test labs'
},
{
    name: 'School',
    value: 'Utah Valley University'
}]

const testStations = [{
    id: 1,
    title: 'Station 1',
    fields: [{
        name: 'Name',
        type: 'text'
    }, {
        name: 'Birthday',
        type: 'date'
    }]
}, {
    id: 2,
    title: 'Station 2',
    fields: [{
        name: 'Height',
        type: 'number'
    }, {
        name: 'Weight',
        type: 'number'
    }]
}]

export default function SessionProvider({ children }) {

    /**
     * Allows our application to see if we are currently in a session.
     * The user should be able to use the whole application while the session is going
     * (it should not cut the session when the view leaves)
     */

    // TODO: update this to get the correct value from db
    let recordId = 0;

    const [sessionIsRunning, setSessionIsRunning] = useState(window.api.getIsSessionRunning());

    const [generalFields, setGeneralFields] = useState(testGeneralFields);

    const [stations, setStations] = useState(testStations);

    const [sessionRecords, setSessionRecords] = useState([]);

    async function startSession() {
        // TODO: get current session records for initial state based on generalInformation and date?
        // const sessionRecords = await getRecordsFromDB() // Make sure to pass in this value down below
        const response = await window.api.startSession(generalFields, stations);
        console.log({ response });
        setSessionIsRunning(true);
        // setSessionRecords(sessionRecords);
    }

    async function stopSession() {
        const response = await window.api.stopSession();
        console.log({ response });
        setSessionIsRunning(false);
    }

    return (
        <SessionContext.Provider
            value={{
                sessionIsRunning,
                startSession,
                stopSession,
                generalFields,
                stations,
                sessionRecords,
            }}
        >
            {children}
        </SessionContext.Provider>
    );
}