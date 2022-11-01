import React from 'react'
import RecordItem from './RecordItem'

export default function RecordList({
    search,
    records = [],
    allFieldKeys = [],
    handleRecordClick,
}) {
    return (
        <tbody className=''>
            {records.map((record, i) => (
                <RecordItem
                    key={record.id}
                    index={i}
                    search={search}
                    record={record}
                    allFieldKeys={allFieldKeys}
                    handleRecordClick={handleRecordClick}
                />
            ))}
        </tbody>
    );
}
