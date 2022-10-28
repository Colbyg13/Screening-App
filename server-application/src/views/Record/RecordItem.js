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
                <td key={key} className='px-4'>
                    {record[key] instanceof Date ?
                        record[key].toLocaleDateString()
                        :
                        typeof record[key] === 'boolean' ?
                            !!record[key] ? 'Yes' : 'No'
                            :
                            record[key] || ''
                    }
                </td>
            ))}
            <td className='w-full' />
        </tr>
    );
}
