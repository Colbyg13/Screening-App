import { MenuItem, Switch, TextField } from '@mui/material';
import React from 'react';
import { SESSION_DATA_TYPES } from '../../constants/session-data-types';
import { useCustomDataTypesContext } from '../../contexts/CustomDataContext';
import { CUSTOM_DATA_TYPE } from '../CustomFields/UserDefinedFields';

export default function RecordModalInputRow({
    fieldKeyMap,
    fieldKey,
    unitConversions,
    record,
    update,
    onChange,
}) {
    const { customDataTypeMap, fullCustomDataTypeMap } = useCustomDataTypesContext();

    const { type: fieldType, name: fieldName } = fieldKeyMap[fieldKey] || {};

    const label = fieldName || fieldKey;
    const customDataType = customDataTypeMap[fieldType];
    const unit = unitConversions[fieldKey];
    const hasUnitConversion = !!unit;
    const fieldPostfix = hasUnitConversion ? `(${unit})` : '';

    const title = `${label} ${fieldPostfix}`;
    // checks update first
    const value =
        update[fieldKey] === undefined
            ? // then record
              record?.[fieldKey] === undefined
                ? ''
                : record[fieldKey]
            : update[fieldKey];

    return (
        <div className="flex">
            <span className="w-40">{title}:</span>
            {customDataType === CUSTOM_DATA_TYPE ? (
                <TextField
                    required
                    className="w-52"
                    select
                    label={label}
                    size="small"
                    value={value}
                    onChange={({ target: { value } }) => onChange(value)}
                >
                    {fullCustomDataTypeMap[fieldType].values.map(value => (
                        <MenuItem key={value} value={value}>
                            {value}
                        </MenuItem>
                    ))}
                </TextField>
            ) : fieldType === SESSION_DATA_TYPES.BOOL ? (
                <Switch checked={!!value} onChange={() => onChange(!value)} />
            ) : fieldType === SESSION_DATA_TYPES.NUMBER || hasUnitConversion ? (
                <TextField
                    type="number"
                    className="w-56"
                    size="small"
                    style={{
                        background: 'white',
                    }}
                    value={value}
                    onChange={({ target: { value } }) => onChange(value)}
                />
            ) : fieldType === SESSION_DATA_TYPES.DATE ? (
                <TextField
                    type="date"
                    className="w-56"
                    size="small"
                    style={{
                        background: 'white',
                    }}
                    value={formatDate(value)}
                    onChange={({ target: { value } }) => {
                        if (value) {
                            const [year, month, day] = value.split('-');
                            onChange(new Date(year, parseInt(month) - 1, day));
                        }
                    }}
                />
            ) : (
                <TextField
                    className="w-56"
                    size="small"
                    style={{
                        background: 'white',
                    }}
                    value={value}
                    onChange={({ target: { value } }) => onChange(value)}
                />
            )}
        </div>
    );
}

function formatDate(date) {
    const d = date instanceof Date ? date : new Date(date);

    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    let year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}
