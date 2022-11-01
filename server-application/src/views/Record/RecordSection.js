import React from 'react';
import { ALL_REQUIRED_STATION_FIELD_KEYS } from '../../constants/required-station-fields';

export default function RecordSection({
    recordKey,
    search,
    value,
}) {

    if (search) return `${value}`.split(new RegExp(`(${search})`, 'i')).map((text, i) => (
        <span key={i} className={text.toLowerCase() === search.toLowerCase() ? 'bg-blue-200' : ''} >{text}</span>
    ));
    return value;
}
