import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';
import { Button, IconButton, MenuItem, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';
import convert from '../../utils/convert';

export const CUSTOM_DATA_TYPE = 'Custom';

// const measurements = [CUSTOM_DATA_TYPE, ...convert().measures()];
const measurements = [CUSTOM_DATA_TYPE, 'glucose', 'length', 'mass', 'pressure', 'temperature'];

export default function UserDefinedFields({
    customDataTypes,
    addCustomDataType,
    updateCustomDataType,
    deleteCustomDataType,
    addCustomDataTypeValue,
    updateCustomDataTypeValue,
    deleteCustomDataTypeValue,
}) {
    const [measurementMap, setMeasurementMap] = useState(
        customDataTypes.reduce((map, { _id, unit, fakeId }) => {
            const id = _id ?? fakeId;

            if (!unit) {
                map[id] = '';
                return map;
            }
            if (unit === CUSTOM_DATA_TYPE) {
                map[id] = CUSTOM_DATA_TYPE;
                return map;
            }

            map[id] = convert().describe(unit).measure;
            return map;
        }, {}),
    );

    function updateMeasurement({ id, measurement, dataTypeIndex }) {
        if (measurement === CUSTOM_DATA_TYPE) {
            updateCustomDataType(
                {
                    unit: CUSTOM_DATA_TYPE,
                    values: [''],
                },
                dataTypeIndex,
            );
        }

        setMeasurementMap(map => ({
            ...map,
            [id]: measurement,
        }));
    }

    useEffect(() => {
        const propsMeasurementMap = customDataTypes.reduce((map, { _id, unit, fakeId }) => {
            const id = _id ?? fakeId;

            if (!unit) {
                map[id] = '';
                return map;
            }
            if (unit === CUSTOM_DATA_TYPE) {
                map[id] = CUSTOM_DATA_TYPE;
                return map;
            }

            map[id] = convert().describe(unit).measure;
            return map;
        }, {});

        setMeasurementMap(map => ({
            ...map,
            ...propsMeasurementMap,
        }));
    }, [customDataTypes]);

    return (
        <div className="py-4 px-8 bg-white rounded-md shadow-md">
            <h2 className="text-2xl mb-4 border-b-2 border-gray-500">User Defined Fields</h2>
            <div className="flex flex-col space-y-2">
                <div className="flex space-x-2">
                    <span className="w-10" />
                    <span className="w-52 text-md font-bold">Name</span>
                    <span className="w-52 text-md font-bold">Measurement</span>
                    <span className="w-52 text-md font-bold">Unit</span>
                </div>
                {customDataTypes.map(({ _id, type, unit, values, fakeId }, dataTypeIndex) => (
                    <div key={dataTypeIndex} className="flex space-x-2">
                        <div>
                            <IconButton onClick={() => deleteCustomDataType(dataTypeIndex)}>
                                <DeleteForeverOutlinedIcon style={{ color: 'red', width: 24 }} />
                            </IconButton>
                        </div>
                        <TextField
                            required
                            key={dataTypeIndex}
                            className="w-52"
                            label="Name"
                            size="small"
                            value={type}
                            onChange={e =>
                                updateCustomDataType({ type: e.target.value }, dataTypeIndex)
                            }
                        />
                        <TextField
                            required
                            className="w-52"
                            select
                            disabled={!!_id}
                            label="Measurement"
                            size="small"
                            value={measurementMap[_id ?? fakeId] ?? ''}
                            onChange={({ target: { value: newMeasurement } }) =>
                                newMeasurement !== measurementMap[_id] &&
                                updateMeasurement({
                                    id: _id ?? fakeId,
                                    measurement: newMeasurement,
                                    dataTypeIndex,
                                })
                            }
                        >
                            {measurements.map(measurement => (
                                <MenuItem
                                    className="capitalize"
                                    key={measurement}
                                    value={measurement}
                                    label={measurement}
                                >
                                    <span
                                        className={`capitalize ${
                                            measurement === CUSTOM_DATA_TYPE ? 'font-semibold' : ''
                                        }`}
                                    >
                                        {measurement}
                                    </span>
                                </MenuItem>
                            ))}
                        </TextField>
                        {measurementMap[_id ?? fakeId] ? (
                            measurementMap[_id ?? fakeId] === CUSTOM_DATA_TYPE ? (
                                <div className="space-y-2">
                                    {values.map((dataTypeValue, valueIndex) => (
                                        <div key={valueIndex} className="flex">
                                            <TextField
                                                required
                                                label="Value"
                                                key={valueIndex}
                                                className="w-52"
                                                size="small"
                                                value={dataTypeValue}
                                                onChange={e =>
                                                    updateCustomDataTypeValue(
                                                        e.target.value,
                                                        dataTypeIndex,
                                                        valueIndex,
                                                    )
                                                }
                                            />
                                            <IconButton
                                                onClick={() =>
                                                    deleteCustomDataTypeValue(
                                                        dataTypeIndex,
                                                        valueIndex,
                                                    )
                                                }
                                            >
                                                <HighlightOffOutlinedIcon
                                                    style={{ color: 'red' }}
                                                />
                                            </IconButton>
                                        </div>
                                    ))}
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        onClick={() => addCustomDataTypeValue(dataTypeIndex)}
                                    >
                                        Add Value
                                    </Button>
                                </div>
                            ) : (
                                <TextField
                                    required
                                    className="w-52"
                                    select
                                    label="Unit"
                                    size="small"
                                    value={unit}
                                    onChange={({ target: { value: newUnit } }) =>
                                        newUnit !== unit &&
                                        updateCustomDataType(
                                            {
                                                unit: newUnit,
                                                values: undefined,
                                            },
                                            dataTypeIndex,
                                        )
                                    }
                                >
                                    {convert()
                                        .list(measurementMap[_id ?? fakeId])
                                        .map(({ abbr, singular, measure, system }) => (
                                            <MenuItem
                                                key={abbr}
                                                value={abbr}
                                                label={`${abbr}-${measure}-${system}`}
                                            >
                                                {singular}
                                            </MenuItem>
                                        ))}
                                </TextField>
                            )
                        ) : null}
                    </div>
                ))}
                <Button
                    fullWidth
                    color="secondary"
                    variant="outlined"
                    onClick={() => addCustomDataType()}
                >
                    New Custom Type
                </Button>
            </div>
        </div>
    );
}
