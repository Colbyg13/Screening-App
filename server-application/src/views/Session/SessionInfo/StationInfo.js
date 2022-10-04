import { Card, CardContent, Chip } from '@mui/material'
import React from 'react'
import { SESSION_DATA_TYPE_LABELS } from '../../../constants/session-data-types'

export default function StationInfo({
    isGeneral,
    station: {
        name,
        fields,
    },
    users = [],
}) {

    return (
        <Card>
            <CardContent>
                <div className='space-x-2'>
                    <div className='text-2xl'>{name}</div>
                    <div className='text-lg'>Fields:</div>
                    {fields.map(({ name, type, value }) => (
                        <Chip label={`${name}: ${isGeneral ? value : SESSION_DATA_TYPE_LABELS[type]}`} variant="outlined" />
                    ))}
                    {users.length ? (
                        <>
                            <div className='text-lg'>Users:</div>
                            {users.map(({ username }) => (
                                <Chip label={username} variant="outlined" />
                            ))}
                        </>
                    ) : null}
                </div>
            </CardContent>
        </Card >
    )
}
