import React from 'react';

export default function RecordSection({
    recordKey,
    search,
    value,
}) {

    if (search && ['id', 'name'].includes(recordKey)) return `${value}`.split(new RegExp(`(${search})`, 'i')).map((text, i) => (
        <span key={i} className={text.toLowerCase() === search.toLowerCase() ? 'bg-blue-200' : ''} >{text}</span>
    ));
    return value;
}
