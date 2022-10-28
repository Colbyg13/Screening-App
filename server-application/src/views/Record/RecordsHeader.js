import React from 'react'

export default function RecordsHeader({
    allFieldKeys = [],
    fieldKeyMap = {},
}) {
    return (
        <thead className='py-2 h-10 min-h-fit sticky top-0 bg-white shadow-lg'>
            <tr className=''>
                {allFieldKeys.map(key => (
                    <th className='px-6 py-3 hover:bg-gray-100 cursor-pointer' >{fieldKeyMap[key]?.name || key}</th>
                ))}
                <th className='w-full' />
            </tr>
        </thead>
    )
}
