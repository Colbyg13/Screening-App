import { CircularProgress } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { ALL_REQUIRED_STATION_FIELD_KEYS, REQUIRED_STATION_FIELDS } from '../../constants/required-station-fields';
import useFieldKeys from '../../hooks/useFieldKeys';
import RecordList from './RecordList';
import RecordsHeader from './RecordsHeader';

const recordPageSize = 100;

export default function Records() {

  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [noMoreRecords, setNoMoreRecords] = useState(false);
  const [sortArr, setSortArr] = useState([]);
  const mainSortKey = useMemo(() => sortArr[0]?.[0], [sortArr]);
  const [skip, setSkip] = useState(0);
  const handleScroll = e => {
    const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
    if (bottom) setSkip(skip => skip + recordPageSize);
  }
  const { allFieldKeys, fieldKeyMap, sortedFieldKeys } = useFieldKeys();

  const sort = useMemo(() => sortArr.reduce((all, [key, sortValue]) => ({
    ...all,
    [key]: sortValue,
  }), {}), [sortArr]);

  const updateSortArray = key => {
    const [_, oldValue] = sortArr.find(([k]) => k === key);
    setSortArr(sortArr => [[key, oldValue < 0 ? 1 : -1], ...sortArr.filter(([k]) => k !== key)]);
  }

  useEffect(() => {
    setSortArr([
      ['id', -1],
      ...ALL_REQUIRED_STATION_FIELD_KEYS.map(key => [key, 1]),
      ...allFieldKeys.filter(key => !REQUIRED_STATION_FIELDS[key] && (key !== 'id')).map(key => [key, 1]),
    ]);
  }, [allFieldKeys])

  useEffect(() => {
    setSkip(0);
  }, [sort])

  useEffect(() => {
    if (!noMoreRecords || !skip) {
      window.api.getRecords(sort, skip, recordPageSize).then(fetchedRecords => {
        if (fetchedRecords.length) {
          setRecords(records => skip ? [...records, ...fetchedRecords] : fetchedRecords);
          if (noMoreRecords) setNoMoreRecords(false);
        } else {
          setNoMoreRecords(true);
        }
        setLoading(false);
      });
    }
  }, [sort, skip, noMoreRecords]);

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
          <div className='bg-white max-h-full pb-32 overflow-auto'
            onScroll={handleScroll}
          >
            <table className='w-full table-auto'>
              <RecordsHeader
                mainSortKey={mainSortKey}
                allFieldKeys={sortedFieldKeys}
                fieldKeyMap={fieldKeyMap}
                updateSortArray={updateSortArray}
                sort={sort}
              />
              <RecordList
                records={records}
                allFieldKeys={sortedFieldKeys}
              />
            </table>
            {noMoreRecords ? (
              <h3 className='text-xl'>End of list</h3>
            ) : null}
          </div>
        ) : (
          <div>No records found</div>
        )}
    </div>
  )
}
