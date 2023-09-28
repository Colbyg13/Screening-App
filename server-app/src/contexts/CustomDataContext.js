import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

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

    const fetchData = async () => {
        setLoading(true);
        try {
            const customDataTypes = await window.api.getCustomDataTypes();
            setCustomDataTypes(customDataTypes);
        } catch (error) {
            console.error("Could not get custom data types", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
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