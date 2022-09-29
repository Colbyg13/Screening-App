import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';
import { IconButton, MenuItem, TextField } from '@mui/material';
import React from 'react';
import { ALL_SESSION_DATA_TYPES, SESSION_DATA_TYPE_LABELS } from '../../../constants/session-data-types';


export default function StationField({
    isGeneral,
    stationIndex,
    fieldIndex,
    field,
    field: {
        name,
        type,
        value,
    },
    updateField,
    deleteField,
}) {

    const handleChange = (e, key) => updateField(stationIndex, fieldIndex, { ...field, [key]: e.target.value });
    const handleNameChange = e => handleChange(e, 'name');
    const handleValueChange = e => handleChange(e, 'value');
    const handleTypeChange = e => handleChange(e, 'type');

    return (
        <div className='flex space-x-2'>
            <TextField
                className='w-52'
                label="Field"
                variant="outlined"
                size='small'
                value={name}
                onChange={handleNameChange}
            />
            {isGeneral ? (
                <TextField
                    className='w-52'
                    label="Value"
                    variant="outlined"
                    size='small'
                    value={value}
                    onChange={handleValueChange}
                />
            ) : (
                <TextField
                    className='w-52'
                    select
                    label="Type"
                    size='small'
                    value={type}
                    onChange={handleTypeChange}
                >
                    {ALL_SESSION_DATA_TYPES.map(type => (
                        <MenuItem key={type} value={type}>{SESSION_DATA_TYPE_LABELS[type]}</MenuItem>
                    ))}
                </TextField>
            )}
            <IconButton onClick={() => deleteField(stationIndex, fieldIndex)}            >
                <HighlightOffOutlinedIcon style={{ color: 'red' }} />
            </IconButton>
        </div>
    )
}
