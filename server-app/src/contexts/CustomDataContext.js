import axios from 'axios';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { LOG_LEVEL } from '../constants/log-levels';
import { serverURL } from '../constants/server';
import { useSnackBarContext } from './SnackbarContext';

const CustomDataTypesContext = createContext({
    loading: false,
    customDataTypes: [],
    customDataTypeMap: {},
    fetchData: () => {},
});

export const useCustomDataTypesContext = () => useContext(CustomDataTypesContext);

export default function CustomDataTypesProvider({ children }) {
    const { addSnackBar } = useSnackBarContext();

    const [customDataTypes, setCustomDataTypes] = useState([]);
    const [loading, setLoading] = useState(false);

    const customDataTypeMap = useMemo(
        () =>
            customDataTypes.reduce(
                (all, { type, unit }) => ({
                    ...all,
                    [type]: unit,
                }),
                {},
            ),
        [customDataTypes],
    );

    const fullCustomDataTypeMap = useMemo(
        () =>
            customDataTypes.reduce(
                (all, dataType) => ({
                    ...all,
                    [dataType.type]: dataType,
                }),
                {},
            ),
        [customDataTypes],
    );

    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await axios.get(`${serverURL}/api/v1/dataTypes`);
            setCustomDataTypes(result.data);
        } catch (error) {
            console.error('Could not get custom data types', error);
            addSnackBar({
                title: 'Error',
                message: `Error getting custom data types. ${error}`,
                variant: 'danger',
                timeout: 2500,
            });
            window.api.writeLog(LOG_LEVEL.ERROR, `Could not get custom data types: ${error}`);
        } finally {
            setLoading(false);
        }
    };

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
