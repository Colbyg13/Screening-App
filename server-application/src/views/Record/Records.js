import { CircularProgress } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { ALL_REQUIRED_STATION_FIELD_KEYS, REQUIRED_STATION_FIELDS } from '../../constants/required-station-fields';
import useFieldKeys from '../../hooks/useFieldKeys';
import RecordList from './RecordList';
import RecordsHeader from './RecordsHeader';

export default function Records() {

  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState();

  const {
    allFieldKeys,
    fieldKeyMap,
  } = useFieldKeys();

  useEffect(() => {
    window.api.getRecords().then(records => {
      setRecords(records);
      setLoading(false);
    });
  }, []);

  const sortedFieldKeys = [
    'id',
    ...ALL_REQUIRED_STATION_FIELD_KEYS,
    ...allFieldKeys.filter(key => !REQUIRED_STATION_FIELDS[key] && (key !== 'id')),
  ];

  console.log({ sortedFieldKeys, REQUIRED_STATION_FIELDS })

  return (
    <div className='pt-6 w-full h-full overflow-hidden'>
      <div className='flex justify-between items-center'>
        <h2 className='text-2xl'>Records</h2>
        <button className='px-4 py-2 bg-green-500 hover:bg-green-400'>
          Export
        </button>
      </div>
      {loading ? (
        <CircularProgress />
      )
        :
        records.length ? (
          <div className='bg-white max-h-full pb-32 overflow-auto'>
            <table className='w-full table-auto'>
              <RecordsHeader
                allFieldKeys={sortedFieldKeys}
                fieldKeyMap={fieldKeyMap}
              />
              <RecordList
                records={records}
                allFieldKeys={sortedFieldKeys}
              />
            </table>
          </div>
        ) : (
          <div>No records found</div>
        )}
    </div>
  )
}
