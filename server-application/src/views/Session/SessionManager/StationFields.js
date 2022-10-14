import { Button, IconButton } from '@mui/material';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import React from 'react';
import StationField from './StationField';

export default function StationFields({
    isGeneral,
    stationIndex,
    station: {
        name,
        fields = [],
    },
    addField,
    updateField,
    deleteField,
    deleteStation,
}) {

    return (
        <div className='space-y-2'>
            <div className='flex items-center'>
                <h2 className='text-2xl'>{name}</h2>
                {isGeneral ? null : (
                    <IconButton onClick={() => deleteStation(stationIndex)}>
                        <DeleteForeverOutlinedIcon style={{ color: 'red', width: 24 }} />
                    </IconButton>
                )}
            </div>
            {fields.map((field, i) => (
                <StationField
                    key={i}
                    isGeneral={isGeneral}
                    stationIndex={stationIndex}
                    fieldIndex={i}
                    field={field}
                    updateField={updateField}
                    deleteField={deleteField}
                />
            ))}
            <Button
                fullWidth
                variant="outlined"
                onClick={() => addField(stationIndex)}
            >
                Add Field
            </Button>
        </div>
    )
}
