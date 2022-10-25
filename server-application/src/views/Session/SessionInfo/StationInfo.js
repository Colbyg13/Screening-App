import { Card, CardContent, Chip } from '@mui/material'
import React from 'react'
import { ALL_REQUIRED_STATION_FIELDS } from '../../../constants/required-station-fields';
import { SESSION_DATA_TYPE_LABELS } from '../../../constants/session-data-types'
import { useCustomDataTypesContext } from '../../../contexts/CustomDataContext'

export default function StationInfo({
    isGeneral,
    stationIndex,
    station: {
        name,
        fields,
    },
    users = [],
}) {

    const { customDataTypeMap } = useCustomDataTypesContext();

    const shouldDisplayRequiredFields = !isGeneral && !stationIndex;

    const displayFields = shouldDisplayRequiredFields ?
        [...ALL_REQUIRED_STATION_FIELDS, ...fields]
        :
        fields;

    return (
        <Card>
            <CardContent>
                <div className='space-x-2'>
                    <div className='text-2xl'>{name}</div>
                    <div className='text-lg'>Fields:</div>
                    {displayFields.map(({ name, type, value }) => (
                        <Chip key={name} label={`${name}: ${isGeneral ? value : SESSION_DATA_TYPE_LABELS[type] || `${type} (${customDataTypeMap[type]})`} `} variant="outlined" />
                    ))}
                    {users.length ? (
                        <>
                            <div className='text-lg'>Connected Devices:</div>
                            {users.map(({ username }) => (
                                <Chip key={username} label={username} variant="outlined" />
                            ))}
                        </>
                    ) : null}
                </div>
            </CardContent>
        </Card >
    )
}
