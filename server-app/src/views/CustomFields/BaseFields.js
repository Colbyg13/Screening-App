import { TextField } from '@mui/material'
import React from 'react'
import {
    ALL_SESSION_DATA_TYPES,
    SESSION_DATA_TYPE_LABELS,
} from '../../constants/session-data-types'

export default function BaseFields() {
    return (
        <div className="h-fit border border-gray-800 p-4 flex flex-col items-center rounded-md">
            <h2 className="text-2xl">Base Types</h2>
            <div className="flex flex-col space-y-2">
                {ALL_SESSION_DATA_TYPES.map(baseType => (
                    <TextField
                        key={baseType}
                        className="w-52"
                        disabled
                        size="small"
                        value={SESSION_DATA_TYPE_LABELS[baseType]}
                    />
                ))}
            </div>
        </div>
    )
}
