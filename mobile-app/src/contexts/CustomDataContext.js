import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useSessionContext } from "./SessionContext";

const CUSTOM_DATA_STORAGE_KEY = 'customData';

const CustomDataTypesContext = createContext({
    loading: false,
    customDataTypes: [],
    customDataTypeMap: {},
    fetchData: () => { },
});

export const useCustomDataTypesContext = () => useContext(CustomDataTypesContext);

export default function CustomDataTypesProvider({ children }) {

    const { isConnected, serverIp } = useSessionContext();

    const [customDataTypes, setCustomDataTypes] = useState([]);
    const [loading, setLoading] = useState(false);

    const customDataTypeMap = useMemo(() => customDataTypes.reduce((all, { type, unit }) => ({
        ...all,
        [type]: unit,
    }), {}), [customDataTypes]);

    //Grabs custom data information from Local Storage. 
    useEffect(() => {
        // initially get custom data from async storage
        AsyncStorage.getItem(CUSTOM_DATA_STORAGE_KEY)
            // if there are custom Data types, then we don't want to override it because it came from the DB already
            .then(storedCustomDataString => setCustomDataTypes(customDataTypes => customDataTypes.length ?
                customDataTypes
                :
                JSON.parse(storedCustomDataString) || []
            ))
    }, []);

    useEffect(() => {
        // saves the new custom data types into Async Storage
        if (customDataTypes.length) AsyncStorage.setItem(CUSTOM_DATA_STORAGE_KEY, JSON.stringify(customDataTypes));
    }, [customDataTypes]);

    useEffect(() => {
        // gets data from db and uses that
        if (serverIp) fetchData();
    }, [serverIp, isConnected]);
    //Grabs custom data information directly from the database. 
    async function fetchData() {
        setLoading(true);
        try {
            console.log({ serverIp })
            const url = `${serverIp}/api/v1/custom-data-types`;
            const { data: customDataTypes = [] } = await axios.get(url, {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                },
            })
            if (customDataTypes) {
                setCustomDataTypes(customDataTypes)
            } else {
                console.error('Could not retrieve custom data types.')
            }
            setLoading(false);
        } catch (err) {
            console.error({ err })
        }
    }
    return (
        <CustomDataTypesContext.Provider
            value={{
                loading,
                customDataTypes,
                customDataTypeMap,
                fetchData,
            }}
        >
            {children}
        </CustomDataTypesContext.Provider>
    );
}