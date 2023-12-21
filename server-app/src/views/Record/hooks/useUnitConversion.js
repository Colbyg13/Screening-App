import { useEffect, useState } from 'react'
import { useCustomDataTypesContext } from '../../../contexts/CustomDataContext'

export default function useUnitConversion({ allFields }) {
    const { customDataTypeMap, loading } = useCustomDataTypesContext()

    const [unitConversions, setUnitConversions] = useState({})

    useEffect(() => {
        const newUnitConversion = allFields
            .filter(
                ({ type }) =>
                    type && customDataTypeMap[type] && customDataTypeMap[type] !== 'Custom',
            )
            .reduce(
                (all, { key, type }) => ({
                    ...all,
                    [key]: customDataTypeMap[type],
                }),
                {},
            )

        setUnitConversions(newUnitConversion)
    }, [allFields])

    const updateFieldUnit = (key, newUnit) => {
        setUnitConversions(unitConversions => ({
            ...unitConversions,
            [key]: newUnit,
        }))
    }

    return {
        loading,
        unitConversions,
        updateFieldUnit,
    }
}
