import { useEffect, useState } from 'react';
import { useCustomDataTypesContext } from '../../../contexts/CustomDataContext';
import { CUSTOM_DATA_TYPE } from '../../CustomFields/UserDefinedFields';

export default function useUnitConversion({ allFields }) {
    const { customDataTypeMap, loading } = useCustomDataTypesContext();

    const [unitConversions, setUnitConversions] = useState({});

    useEffect(() => {
        const newUnitConversion = allFields
            .filter(
                ({ type }) =>
                    type && customDataTypeMap[type] && customDataTypeMap[type] !== CUSTOM_DATA_TYPE,
            )
            .reduce(
                (all, { key, type }) => ({
                    ...all,
                    [key]: customDataTypeMap[type],
                }),
                {},
            );

        setUnitConversions(newUnitConversion);
    }, [allFields]);

    const updateFieldUnit = (key, newUnit) => {
        setUnitConversions(unitConversions => ({
            ...unitConversions,
            [key]: newUnit,
        }));
    };

    return {
        loading,
        unitConversions,
        updateFieldUnit,
    };
}
