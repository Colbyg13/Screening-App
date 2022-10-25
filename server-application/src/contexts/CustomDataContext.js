import { createContext, useContext, useEffect, useMemo, useState } from "react";
import replace from "../utils/replace";

const CustomDataTypesContext = createContext({
    customDataTypes: [],
    customDataTypeMap: {},
    addCustomDataType: () => { },
    updateCustomDataType: () => { },
    deleteCustomDataType: () => { },
    addCustomDataTypeValue: () => { },
    updateCustomDataTypeValue: () => { },
    deleteCustomDataTypeValue: () => { },
});

export const useCustomDataTypesContext = () => useContext(CustomDataTypesContext);

const customDataTypesStorageKey = 'customDataTypes';

const baseDataType = {
    type: '',
    unit: '',
}

export default function CustomDataTypesProvider({ children }) {

    const [customDataTypes, setCustomDataTypes] = useState(JSON.parse(localStorage.getItem(customDataTypesStorageKey)) || []);

    const customDataTypeMap = useMemo(() => customDataTypes.reduce((all, { type, unit }) => ({
        ...all,
        [type]: unit,
    }), {}), [customDataTypes])

    const addCustomDataType = () => setCustomDataTypes(dataTypes => [...dataTypes, baseDataType]);
    const updateCustomDataType = (update, index) => setCustomDataTypes(dataTypes => replace(dataTypes, index, { ...dataTypes[index], ...update }));
    const deleteCustomDataType = index => setCustomDataTypes(dataTypes => dataTypes.filter((_, i) => i !== index));
    const addCustomDataTypeValue = dataTypeIndex => setCustomDataTypes(dataTypes => replace(dataTypes, dataTypeIndex, {
        ...dataTypes[dataTypeIndex],
        values: [...dataTypes[dataTypeIndex].values, ''],
    }));
    const updateCustomDataTypeValue = (update, dataTypeIndex, valueIndex) => setCustomDataTypes(dataTypes => replace(dataTypes, dataTypeIndex, {
        ...dataTypes[dataTypeIndex],
        values: replace(dataTypes[dataTypeIndex].values, valueIndex, update),
    }));
    const deleteCustomDataTypeValue = (dataTypeIndex, valueIndex) => setCustomDataTypes(dataTypes => replace(dataTypes, dataTypeIndex, {
        ...dataTypes[dataTypeIndex],
        values: dataTypes[dataTypeIndex].values.filter((_, i) => i !== valueIndex),
    }));

    useEffect(() => {
        localStorage.setItem(customDataTypesStorageKey, JSON.stringify(customDataTypes));
    }, [customDataTypes]);

    return (
        <CustomDataTypesContext.Provider
            value={{
                customDataTypes,
                customDataTypeMap,
                addCustomDataType,
                updateCustomDataType,
                deleteCustomDataType,
                addCustomDataTypeValue,
                updateCustomDataTypeValue,
                deleteCustomDataTypeValue,
            }}
        >
            {children}
        </CustomDataTypesContext.Provider>
    );
}