import { TextField } from '@mui/material'
import React from 'react'
import { ALL_SESSION_DATA_TYPES, SESSION_DATA_TYPE_LABELS } from '../../constants/session-data-types';


export default function CustomFields() {


    return (
        <div className='h-screen px-8 pt-8 pb-16 overflow-auto'>
            <h1>Base Types</h1>
            <div className='flex flex-col space-y-2'>
                {ALL_SESSION_DATA_TYPES.map(baseType => (
                    <TextField
                        key={baseType}
                        className='w-52'
                        disabled
                        size='small'
                        value={SESSION_DATA_TYPE_LABELS[baseType]}
                    />
                ))}
            </div>
        </div>
    )
}
