import { createContext, useContext } from "react";

const SessionContext = createContext();

export const useSessionContext = () => useContext(SessionContext);

export default function SessionProvider({ children }) {

    /**
     * Allows our application to see if we are currently in a session.
     * The user should be able to use the whole application while the session is going
     * (it should not cut the session when the view leaves)
     */
    

    return (
        <SessionContext.Provider
            value={{
            }}
        >
            {children}
        </SessionContext.Provider>
    );
}