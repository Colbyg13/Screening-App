import { createContext, useContext } from "react";

const RecordContext = createContext();

export const useRecordContext = () => useContext(RecordContext);

export default function RecordProvider({ children }) {

    /**
     * Our connection to the database
     * Should allow the application to have access to all records anywhere
     * Should provide an api for CRUD into our DB
     */

    return (
        <RecordContext.Provider
            value={{
            }}
        >
            {children}
        </RecordContext.Provider>
    );
}