import { Button } from '@mui/material';
import React from 'react';
import { useSessionContext } from '../../../contexts/SessionContext';
import StationFields from './StationFields';

export default function StationManager() {

  const {
    sessionInfo,
    addStation,
    deleteStation,
    addField,
    updateField,
    deleteField,
  } = useSessionContext();

  return (
    <div className='h-screen flex flex-col items-center overflow-y-scroll'>
      <div className='w-fit bg-gray-50 space-y-4 p-16'>
        <StationFields
          isGeneral
          station={{
            name: 'General Fields',
            fields: sessionInfo.generalFields,
          }}
          addField={addField}
          updateField={updateField}
          deleteField={deleteField}
        />
        {sessionInfo.stations.map((station, i) => (
          <StationFields
            stationIndex={i}
            station={station}
            addField={addField}
            updateField={updateField}
            deleteField={deleteField}
            deleteStation={deleteStation}
          />
        ))}
        <Button
          fullWidth
          color='secondary'
          variant="outlined"
          onClick={addStation}
        >
          Add Station
        </Button>
      </div>
    </div>
  )
}
