import { createContext, useContext, useState } from "react";
import replace from "../utils/replace";

const SessionContext = createContext({
    sessionStarted: false,
    generalFields: {},
    stations: [],
    sessionRecords: [],
    createOrUpdateRecord: () => { },
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
    name: 'Station 1',
    fields: [{
        name: 'Name',
        type: 'text'
    }, {
        name: 'Birthday',
        type: 'date'
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

    const [sessionStarted, setSessionStarted] = useState(false);

    const [generalFields, setGeneralFields] = useState(testGeneralFields);

    const [stations, setStations] = useState(testStations);

    // TODO: get current session records for initial state based on generalInformation and date?
    const [sessionRecords, setSessionRecords] = useState([]);

    const createOrUpdateRecord = recordUpdate => {

        // get record from DB. If exists update else create new record


        // TODO: UPDATE. USING FOR TESTING PURPOSES RIGHT NOW
        setSessionRecords(records => {

            const oldRecord = records.find(({ id }) => id === recordUpdate.id);

            // if there isn't a record in our array we want to create it
            if (!oldRecord) return [...records, recordUpdate];

            // otherwise update the record
            return replace(records, records.indexOf(oldRecord), {
                ...oldRecord,
                ...recordUpdate,
            });
        });
    }

    return (
        <SessionContext.Provider
            value={{
                sessionStarted,
                setSessionStarted,
                generalFields,
                stations,
                sessionRecords,
                createOrUpdateRecord,
            }}
        >
            {children}
        </SessionContext.Provider>
    );
}