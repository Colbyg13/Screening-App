import { Button, IconButton } from '@mui/material';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import React from 'react';
import StationField from './StationField';

export default function StationFields({
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
        <div>
            <div className='flex'>
                <h2>{name}</h2>
                {deleteStation ? (
                    <IconButton
                        onClick={deleteStation}
                    >
                        <DeleteForeverOutlinedIcon style={{
                            color: 'red',
                        }} />
                    </IconButton>
                ) : null}
            </div>
            {fields.map((field, i) => (
                <StationField
                    field={field}
                    updateField={update => updateField(i, update)}
                    deleteField={() => deleteField(i)}
                />
            ))}
            <Button
                variant="outlined"
                onClick={addField}
            >
                Add Field
            </Button>
        </div>
    )
}
