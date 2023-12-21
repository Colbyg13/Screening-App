import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';
import { Button, IconButton, MenuItem, TextField } from '@mui/material';
import React from 'react';
import convert from '../../utils/convert';

export const CUSTOM_DATA_TYPE = 'Custom';

const customType = {
    abbr: CUSTOM_DATA_TYPE,
    measure: CUSTOM_DATA_TYPE,
    system: CUSTOM_DATA_TYPE,
    singular: CUSTOM_DATA_TYPE,
    plural: CUSTOM_DATA_TYPE,
};

const allUnits = [
    customType,
    ...convert().list('length'),
    ...convert().list('mass'),
    ...convert().list('glucose'),
    ...convert().list('temperature'),
    ...convert().list('pressure'),
];

export default function UserDefinedFields({
    customDataTypes,
    addCustomDataType,
    updateCustomDataType,
    deleteCustomDataType,
    addCustomDataTypeValue,
    updateCustomDataTypeValue,
    deleteCustomDataTypeValue,
}) {
    return (
        <div className="py-4 px-8 bg-white rounded-md shadow-md">
            <h2 className="text-2xl mb-4 border-b-2 border-gray-500">User Defined Fields</h2>
            <div className="flex flex-col space-y-2">
                <div className="flex space-x-2">
                    <span className="w-10" />
                    <span className="w-52 text-md font-bold">Type</span>
                    <span className="w-52 text-md font-bold">Unit</span>
                    <span className="w-52 text-md font-bold">Values</span>
                </div>
                {customDataTypes.map(({ _id, type, unit, values }, dataTypeIndex) => (
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
                            label="Type"
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
                            label="Unit"
                            size="small"
                            value={unit}
                            onChange={({ target: { value: newUnit } }) =>
                                newUnit !== unit &&
                                updateCustomDataType(
                                    {
                                        unit: newUnit,
                                        values: newUnit === CUSTOM_DATA_TYPE ? [''] : undefined,
                                    },
                                    dataTypeIndex,
                                )
                            }
                        >
                            {(_id
                                ? unit === CUSTOM_DATA_TYPE
                                    ? [customType]
                                    : convert().list(convert().describe(unit).measure)
                                : allUnits
                            ).map(({ abbr, singular, measure, system }) => (
                                <MenuItem
                                    key={abbr}
                                    value={abbr}
                                    label={`${abbr}-${measure}-${system}`}
                                >
                                    {singular}
                                </MenuItem>
                            ))}
                        </TextField>
                        {unit === CUSTOM_DATA_TYPE ? (
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
                                                deleteCustomDataTypeValue(dataTypeIndex, valueIndex)
                                            }
                                        >
                                            <HighlightOffOutlinedIcon style={{ color: 'red' }} />
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
