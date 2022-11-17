import React from 'react'
import RecordSection from './RecordSection';

export default function RecordItem({
    record,
    search,
    allFieldKeys = [],
    index,
    handleRecordClick,
}) {

    const even = index % 2 === 0;

    return (
        <tr className={`cursor-pointer ${even ? 'bg-gray-300 hover:bg-slate-300' : 'bg-white hover:bg-slate-200'}`}
            onClick={() => handleRecordClick(record)}
        >
            {allFieldKeys.map(key => (
                <td key={key} className='px-4'>
                    <RecordSection
                        recordKey={key}
                        search={search}
                        value={record[key] instanceof Date ?
                            record[key].toLocaleDateString()
                            :
                            typeof record[key] === 'boolean' ?
                                !!record[key] ? 'Yes' : 'No'
                                :
                                typeof record[key] === 'number' ?
                                    record[key].toFixed(2)
                                    :
                                    record[key] || ''}
                    />
                </td>
            ))}
            <td className='w-full' />
        </tr>
    );
}
