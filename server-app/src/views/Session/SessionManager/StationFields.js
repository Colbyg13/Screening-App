import { Button, IconButton } from '@mui/material'
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined'
import React from 'react'
import StationField from './StationField'
import { ALL_REQUIRED_STATION_FIELDS } from '../../../constants/required-station-fields'

export default function StationFields({
    isGeneral,
    stationIndex,
    station: { name, fields = [] },
    addField,
    updateField,
    deleteField,
    deleteStation,
}) {
    const shouldHaveRequiredFields = !isGeneral && !stationIndex

    return (
        <div className="space-y-2">
            <div className="flex items-center">
                <h2 className="text-2xl">{name}</h2>
                {deleteStation ? (
                    <IconButton onClick={() => deleteStation(stationIndex)}>
                        <DeleteForeverOutlinedIcon style={{ color: 'red', width: 24 }} />
                    </IconButton>
                ) : null}
            </div>
            {/* Required Fields */}
            {shouldHaveRequiredFields
                ? ALL_REQUIRED_STATION_FIELDS.map((field, i) => (
                      <StationField
                          key={i}
                          isGeneral={isGeneral}
                          stationIndex={stationIndex}
                          fieldIndex={i}
                          field={field}
                      />
                  ))
                : null}
            {/* User Defined Fields */}
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
            <Button fullWidth variant="outlined" onClick={() => addField(stationIndex)}>
                Add Field
            </Button>
        </div>
    )
}
