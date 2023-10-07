import React from 'react'
import RecordSection from './RecordSection';
import { useCustomDataTypesContext } from '../../contexts/CustomDataContext';

export default function RecordItem({
    record,
    search,
    allFieldKeys = [],
    fieldKeyMap = {},
    index,
    handleRecordClick,
}) {

    const { customDataTypeMap } = useCustomDataTypesContext();

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
                        value={record[key] === undefined ? ''
                            :
                            fieldKeyMap[key]?.type === "date" ?
                                new Date(record[key]).toLocaleDateString()
                                :
                                fieldKeyMap[key]?.type === 'bool' ?
                                    !!record[key] ? 'Yes' : 'No'
                                    :
                                    fieldKeyMap[key]?.type === 'number' || customDataTypeMap[fieldKeyMap[key]?.type] ?
                                        `${record[key]}`.match(/^\d+\.\d+$/) ?
                                            Math.round(+record[key] * 100) / 100
                                            :
                                            record[key]
                                        :
                                        record[key]}
                    />
                </td>
            ))}
            <td className='w-full' />
        </tr>
    );
}
