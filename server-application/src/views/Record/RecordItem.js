import React from 'react'

export default function RecordItem({
    record,
    allFieldKeys = [],
    index,
}) {

    const even = index % 2 === 0;

    return (
        <tr className={even ? 'bg-gray-300' : ''}>
            {allFieldKeys.map(key => (
                <td className='px-2'>{record[key] instanceof Date ? record[key].toLocaleDateString() : record[key] || ''}</td>
            ))}
            <td className='w-full' />
        </tr>
    );
}
