import React from 'react'
import StationField from './StationField'

export default function StationFields({
    station: {
        name,
        fields = [],
    }
}) {
    return (
        <div>
            <h2>{name}</h2>
            {fields.map(field => (
                <StationField
                    field={field}
                />
            ))}
        </div>
    )
}
