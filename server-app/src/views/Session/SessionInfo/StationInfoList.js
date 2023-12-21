import React from 'react'
import { useSessionContext } from '../../../contexts/SessionContext'
import StationInfo from './StationInfo'

export default function StationInfoList() {
    const {
        sessionInfo: { generalFields, stations = [] },
        connectedUsersByStation,
    } = useSessionContext()

    return (
        <div className="max-h-full flex-1 space-y-4 overflow-y-auto pt-8 px-16 pb-16">
            <StationInfo
                isGeneral
                station={{
                    name: 'General Fields',
                    fields: generalFields,
                }}
            />
            {stations.map((station, i) => (
                <StationInfo
                    key={i}
                    stationIndex={i}
                    station={station}
                    users={connectedUsersByStation[station.id]}
                />
            ))}
        </div>
    )
}
