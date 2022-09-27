import React, { useState } from 'react'
import replace from '../../../utils/replace';
import StationFields from './StationFields';

export default function StationManager() {

  //TODO: get and save from local storage

  const [generalFields, setGeneralFields] = useState({
    school: 'viliki middle',
    village: 'viliki',
  })
  const [stations, setStations] = useState([]);

  const updateStation = (stationUpdate, index) => setStations(stations => replace(stations, index, stationUpdate));

  const addStation = () => setStations(stations => [...stations, { name: `Station ${stations.length + 1}` }])

  return (
    <div>
      <StationFields
        station={{
          name: 'General Fields',
          fields: Object.entries(generalFields)
            .map(([name, type]) => ({
              name,
              type
            }))
        }}
      />
      {stations.map(station => (
        <StationFields
          station={station}
        />
      ))}
    </div>
  )
}
