import React from 'react'
import { useSessionContext } from '../../../contexts/SessionContext'
import StationInfo from './StationInfo';

export default function StationInfoList() {

    const {
        sessionInfo: {
            generalFields,
            stations,
        }
    } = useSessionContext();

    return (
        <div className='h-screen p-16 space-y-4 overflow-y-scroll'>
            <StationInfo
                isGeneral
                station={{
                    name: 'General Fields',
                    fields: generalFields,
                }}
            />
            {stations.map(station => (
                <StationInfo
                    station={station}
                />
            ))}
        </div>
    )
}
