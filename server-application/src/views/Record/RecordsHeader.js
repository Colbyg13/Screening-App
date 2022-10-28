import React from 'react'
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

export default function RecordsHeader({
    mainSortKey,
    allFieldKeys = [],
    fieldKeyMap = {},
    sort = {},
    updateSortArray = () => { },
}) {

    return (
        <thead className='py-2 h-10 min-h-fit sticky top-0 bg-white shadow-lg'>
            <tr className=''>
                {allFieldKeys.map(key => (
                    <th key={key} className={`px-4 py-3 text-start hover:bg-gray-100 cursor-pointer shadow-inner ${mainSortKey === key ? 'text-blue-500' : ''}`}
                        onClick={() => updateSortArray(key)}
                    >
                        <div className='flex space-x-1'>
                            <span>{fieldKeyMap[key]?.name || key}</span>
                            {sort[key] < 0 ? (
                                <ArrowDropDownIcon size={12} />
                            ) : (
                                <ArrowDropUpIcon />
                            )}
                        </div>
                    </th>
                ))}
                <th className='w-full' />
            </tr>
        </thead>
    )
}
