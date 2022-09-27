import { Input } from '@mui/material'
import React from 'react'

export default function StationField({
    field: {
        name,
        type,
    },
}) {
    return (
        <div className='flex'>
            <Input
                title="Field"
                value={name}
            />
            <Input
                title="Value"
                value={type}
            />
        </div>
    )
}
