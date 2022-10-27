import axios from "axios";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useSessionContext } from "./SessionContext";

const CustomDataTypesContext = createContext({
    loading: false,
    customDataTypes: [],
    customDataTypeMap: {},
    fetchData: () => { },
});

export const useCustomDataTypesContext = () => useContext(CustomDataTypesContext);

export default function CustomDataTypesProvider({ children }) {

    const { serverIp } = useSessionContext()

    // TODO: update initial value to get async storage value first (prob needs useEffect because async)
    const [customDataTypes, setCustomDataTypes] = useState([]);
    const [loading, setLoading] = useState(false);

    const customDataTypeMap = useMemo(() => customDataTypes.reduce((all, { type, unit }) => ({
        ...all,
        [type]: unit,
    }), {}), [customDataTypes]);

    useEffect(() => {
        // TODO: put code here for saving to async storage
    }, [customDataTypes])

    useEffect(() => {
        if (serverIp) fetchData();
    }, [serverIp]);

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
            // console.log({ sessionInfo, rest })
            if (customDataTypes) {
                setCustomDataTypes(customDataTypes)
            } else {
                throw new Error('Could not retrieve custom data types.')
            }
            setLoading(false);
        } catch (err) {
            console.log({ err })
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