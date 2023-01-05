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
                <div>
                    <div className='text-2xl mb-2'>{name}</div>
                    <div>
                        <div className='text-lg'>Fields</div>
                        <div className='flex flex-wrap'>
                            {displayFields.map(({ name, type, value }) => (
                                <Chip className='mr-2 mb-2' key={name} label={`${name}: ${isGeneral ? value : SESSION_DATA_TYPE_LABELS[type] || `${type} (${customDataTypeMap[type]})`} `} variant="outlined" />
                            ))}
                        </div>
                    </div>
                    {users.length ? (
                        <div>
                            <div className='text-lg'>Connected Devices</div>
                            <div className='flex flex-wrap'>
                                {users.map(({ username }) => (
                                    <Chip className='mr-2 mb-2' key={username} label={username} variant="outlined" />
                                ))}
                            </div>
                        </div>
                    ) : null}
                </div>
            </CardContent>
        </Card >
    )
}
