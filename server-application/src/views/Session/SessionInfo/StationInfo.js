import React from 'react'
import { useSessionContext } from '../../../contexts/SessionContext'

export default function StationInfo({
    isGeneral,
    station: {
        name,
        fields,
        users = [],
    }
}) {

    return (
        <div className='border border-gray-800 p-4' >
            <h2 className='text-2xl'>{name}</h2>
            <div className='flex space-x-2'>
                {fields.map(({ name, type, value }) => (
                    <div className='border border-gray-400 rounded-full py-1 px-2'>{name}: {isGeneral ? value : type}</div>
                ))}
            </div>
        </div>
    )
}
