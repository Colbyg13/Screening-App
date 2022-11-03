import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CustomDataTypesContext = createContext({
    loading: false,
    customDataTypes: [],
    customDataTypeMap: {},
    fetchData: () => { },
});

export const useCustomDataTypesContext = () => useContext(CustomDataTypesContext);

export default function CustomDataTypesProvider({ children }) {

    const [customDataTypes, setCustomDataTypes] = useState([]);
    const [loading, setLoading] = useState(false);

    const customDataTypeMap = useMemo(() => customDataTypes.reduce((all, { type, unit }) => ({
        ...all,
        [type]: unit,
    }), {}), [customDataTypes]);

    const fullCustomDataTypeMap = useMemo(() => customDataTypes.reduce((all, dataType) => ({
        ...all,
        [dataType.type]: dataType,
    }), {}), [customDataTypes]);

    const fetchData = () => {
        setLoading(true);
        window.api.getCustomDataTypes().then(customDataTypes => {
            setCustomDataTypes(customDataTypes);
            setLoading(false);
        });
    }

    useEffect(() => {
        fetchData()
    }, []);

    return (
        <CustomDataTypesContext.Provider
            value={{
                loading,
                customDataTypes,
                customDataTypeMap,
                fullCustomDataTypeMap,
                fetchData,
            }}
        >
            {children}
        </CustomDataTypesContext.Provider>
    );
}