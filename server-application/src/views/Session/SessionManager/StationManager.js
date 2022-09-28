import { Button } from '@mui/material';
import React, { useEffect, useState } from 'react';
import replace from '../../../utils/replace';
import StationFields from './StationFields';

const sessionInfoStorageKey = 'sessionInfo';

const initialSystemInfo = {
  generalFields: [],
  stations: [],
}

export default function StationManager() {

  const [sessionInfo, setSessionInfo] = useState(JSON.parse(localStorage.getItem(sessionInfoStorageKey)) || initialSystemInfo);

  useEffect(() => {
    localStorage.setItem(sessionInfoStorageKey, JSON.stringify(sessionInfo));
  }, [sessionInfo]);

  const addGeneralField = () => setSessionInfo(sessionInfo => ({
    ...sessionInfo,
    generalFields: [...sessionInfo.generalFields, { name: '', value: '' }]
  }));

  const updateGeneralField = (fieldIndex, update) => setSessionInfo(sessionInfo => ({
    ...sessionInfo,
    generalFields: replace(sessionInfo.generalFields, fieldIndex, update),
  }))

  const deleteGeneralField = fieldIndex => setSessionInfo(sessionInfo => ({
    ...sessionInfo,
    generalFields: sessionInfo.generalFields.filter((_, i) => fieldIndex !== i),
  }))

  const addStation = () => setSessionInfo(sessionInfo => ({
    ...sessionInfo,
    stations: [...sessionInfo.stations, { name: `Station ${sessionInfo.stations.length + 1}`, fields: [] }]
  }));

  const deleteStation = index => setSessionInfo(sessionInfo => ({
    ...sessionInfo,
    stations: sessionInfo.stations
      .filter((_, i) => i !== index)
      .map((station, i) => ({
        ...station,
        name: `Station ${i + 1}`
      })),
  }));

  const addField = stationIndex => setSessionInfo(sessionInfo => ({
    ...sessionInfo,
    stations: replace(sessionInfo.stations, stationIndex, {
      ...sessionInfo.stations[stationIndex],
      fields: [...sessionInfo.stations[stationIndex].fields, { name: '', type: '' }]
    })
  }));

  const updateField = (stationIndex, fieldIndex, update) => setSessionInfo(sessionInfo => ({
    ...sessionInfo,
    stations: replace(sessionInfo.stations, stationIndex, {
      ...sessionInfo.stations[stationIndex],
      fields: replace(sessionInfo.stations[stationIndex].fields, fieldIndex, update),
    })
  }));

  const deleteField = (stationIndex, fieldIndex) => setSessionInfo(sessionInfo => ({
    ...sessionInfo,
    stations: replace(sessionInfo.stations, stationIndex, {
      ...sessionInfo.stations[stationIndex],
      fields: sessionInfo.stations[stationIndex].fields.filter((_, i) => i !== fieldIndex),
    })
  }));


  return (
    <div className='h-screen overflow-y-auto'>
      <StationFields
        station={{
          name: 'General Fields',
          fields: sessionInfo.generalFields,
        }}
        addField={addGeneralField}
        updateField={updateGeneralField}
        deleteField={deleteGeneralField}
      />
      {sessionInfo.stations.map((station, i) => (
        <StationFields
          station={station}
          addField={() => addField(i)}
          updateField={(fieldIndex, update) => updateField(i, fieldIndex, update)}
          deleteField={fieldIndex => deleteField(i, fieldIndex)}
          deleteStation={() => deleteStation(i)}
        />
      ))}
      <Button
        variant="outlined"
        onClick={addStation}
      >
        Add Station
      </Button>
    </div>
  )
}
