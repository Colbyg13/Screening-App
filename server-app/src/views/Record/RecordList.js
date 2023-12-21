import React from 'react'
import RecordItem from './RecordItem'

export default function RecordList({
    search,
    records = [],
    fieldKeyMap = {},
    allFieldKeys = [],
    handleRecordClick,
}) {
    return (
        <tbody className="">
            {records.map((record, i) => (
                <RecordItem
                    key={record.id}
                    index={i}
                    search={search}
                    record={record}
                    fieldKeyMap={fieldKeyMap}
                    allFieldKeys={allFieldKeys}
                    handleRecordClick={handleRecordClick}
                />
            ))}
        </tbody>
    )
}
