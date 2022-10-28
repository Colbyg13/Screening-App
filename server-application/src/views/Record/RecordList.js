import React from 'react'
import RecordItem from './RecordItem'

export default function RecordList({
    records = [],
    allFieldKeys = [],
}) {
    return (
        <tbody className=''>
            {records.map((record, i) => (
                <RecordItem
                index={i}
                    record={record}
                    allFieldKeys={allFieldKeys}
                />
            ))}
        </tbody>
    );
}
