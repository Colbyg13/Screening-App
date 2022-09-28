import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';
import { IconButton, TextField } from '@mui/material';
import React from 'react';


export default function StationField({
    field: {
        name,
        type,
        value,
    },
    updateField,
    deleteField,
}) {
    return (
        <div className='flex'>
            <TextField
                label="Field"
                variant="outlined"
                value={name}
                onChange={({ target: { value } }) => updateField({
                    name: value,
                    type,
                })}
            />
            <TextField
                label="Value"
                variant="outlined"
                value={type || value}
                onChange={({ target: { value } }) => updateField({
                    name,
                    [type ? 'type' : 'value']: value,
                })}
            />
            <IconButton
                onClick={deleteField}
            >
                <HighlightOffOutlinedIcon style={{
                    color: 'red',
                }} />
            </IconButton>
        </div>
    )
}
