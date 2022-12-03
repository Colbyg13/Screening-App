import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';
import { IconButton, MenuItem, TextField } from '@mui/material';
import React from 'react';
import { ALL_SESSION_DATA_TYPES, SESSION_DATA_TYPE_LABELS } from '../../../constants/session-data-types';
import { useCustomDataTypesContext } from '../../../contexts/CustomDataContext';


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

    const {
        customDataTypes,
    } = useCustomDataTypesContext();

    const allDataTypes = [
        ...ALL_SESSION_DATA_TYPES,
        ...customDataTypes.map(({type}) => type),
    ]

    const handleChange = (e, key) => updateField(stationIndex, fieldIndex, { ...field, [key]: e.target.value });
    const handleNameChange = e => handleChange(e, 'name');
    const handleValueChange = e => handleChange(e, 'value');
    const handleTypeChange = e => handleChange(e, 'type');

    return (
        <div className='flex space-x-2'>
            <TextField
                required
                className='w-52'
                label="Field"
                variant="outlined"
                size='small'
                value={name}
                onChange={handleNameChange}
                disabled={!updateField}
            />
            {isGeneral ? (
                <TextField
                    required
                    className='w-52'
                    label="Value"
                    variant="outlined"
                    size='small'
                    value={value}
                    onChange={handleValueChange}
                    disabled={!updateField}
                />
            ) : (
                <TextField
                    required
                    className='w-52'
                    select
                    label="Type"
                    size='small'
                    value={type}
                    onChange={handleTypeChange}
                    disabled={!updateField}
                >
                    {allDataTypes.map(type => (
                        <MenuItem key={type} value={type}>{SESSION_DATA_TYPE_LABELS[type] || type}</MenuItem>
                    ))}
                </TextField>
            )}
            {!!deleteField ? (
                <IconButton onClick={() => deleteField(stationIndex, fieldIndex)}            >
                    <HighlightOffOutlinedIcon style={{ color: 'red' }} />
                </IconButton>
            ) : null}
        </div>
    )
}
