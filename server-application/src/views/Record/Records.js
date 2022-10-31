import { CircularProgress } from '@mui/material';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import useFieldKeys from './hooks/useFieldKeys';
import useFieldSort from './hooks/useFieldSort';
import RecordList from './RecordList';
import RecordSearch from './RecordSearch';
import RecordsHeader from './RecordsHeader';

const recordPageSize = 100;

export default function Records() {

  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [skip, setSkip] = useState(0);
  const [reachedEndOfRecords, setReachedEndOfRecords] = useState(false);
  const { allFieldKeys, fieldKeyMap, sortedFieldKeys } = useFieldKeys();
  const resetSkip = () => setSkip(0);
  const { updateSortArray, mainSortKey, sort } = useFieldSort({ allFieldKeys, resetSkip });
  const [search, setSearch] = useState('');

  useEffect(() => {
    // used for getting our records from the database when sort or skip are updated
    if (!reachedEndOfRecords || !skip) {
      setLoading(true);
      console.log({ sort, skip, search })
      window.api.getRecords(search, sort, skip, recordPageSize)
        .then(fetchedRecords => {
          if (fetchedRecords.length) {
            // add the new records to end of list if skip > 0
            setRecords(records => skip ? [...records, ...fetchedRecords] : fetchedRecords);
            if (reachedEndOfRecords) setReachedEndOfRecords(false);
          } else {
            setReachedEndOfRecords(true);
          }
          setLoading(false);
        });
    }
  }, [sort, skip, search, reachedEndOfRecords]);

  function handleScroll(e) {
    // loads more when reaching the end of the page
    const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
    if (bottom) setSkip(skip => skip + recordPageSize);
  }

  async function updateSearch(newSearch) {
    setSearch(newSearch);
    resetSkip();
  }

  return (
    <div className='w-full h-full overflow-hidden'>
      <div className='pt-8 px-2 pb-2 bg-green-500 flex justify-between items-center'>
        <h2 className='ml-2 font-bold text-2xl'>
          All Records
        </h2>
        <RecordSearch
          updateSearch={updateSearch}
        />
        <button className='px-4 py-1 bg-white hover:bg-gray-100 rounded-md font-bold'>
          Export
        </button>
      </div>
      {records.length ? (
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
          {loading ? (
            <CircularProgress />
          ) : null}
          {reachedEndOfRecords ? (
            <h3 className='text-xl'>End of list</h3>
          ) : null}
        </div>
      ) :
        loading ? (
          <CircularProgress />
        ) : (
          <div>No records found</div>
        )}
    </div>
  )
}