import { CircularProgress } from '@mui/material';
import React, { useEffect, useState } from 'react';
import replace from '../../utils/replace';
import useFieldKeys from './hooks/useFieldKeys';
import useFieldSort from './hooks/useFieldSort';
import RecordTitleBar from './RecordsTitleBar';
import RecordList from './RecordList';
import RecordModal from './RecordModal';
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
  const [selectedRecord, setSelectedRecord] = useState();

  useEffect(() => {
    // used for getting our records from the database when sort or skip are updated
    if (!reachedEndOfRecords || !skip) {
      setLoading(true);
      // console.log({ sort, skip, search })
      getRecords()
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

  function updateSearch(newSearch) {
    setSearch(newSearch);
    resetSkip();
  }
  async function getRecords() {
    return window.api.getRecords(search, sort, skip, recordPageSize, allFieldKeys);
  }

  function handleRecordClick(record) {
    setSelectedRecord(record);
  }

  function handleOnClose(update) {
    if (update) setRecords(records => {
      const oldRecord = records.find(({ id }) => id === update.id);
      return replace(records, records.indexOf(oldRecord), { ...oldRecord, ...update })
    })
    setSelectedRecord();
  }

  return (
    <>
      <RecordModal
        record={selectedRecord}
        allFieldKeys={sortedFieldKeys}
        fieldKeyMap={fieldKeyMap}
        onClose={handleOnClose}
      />
      <div className='w-full h-full overflow-hidden'>
        <RecordTitleBar
          allFieldKeys={sortedFieldKeys}
          updateSearch={updateSearch}
        />
        {records.length ? (
          <div className='bg-white h-full pb-32 overflow-y-auto'
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
                search={search}
                records={records}
                allFieldKeys={sortedFieldKeys}
                handleRecordClick={handleRecordClick}
              />
            </table>
            {loading ? (
              <CircularProgress />
            ) : null}
            {reachedEndOfRecords ? (
              <h3 className='w-full border-4 text-center text-lg'>End of List</h3>
            ) : null}
          </div>
        ) :
          loading ? (
            <CircularProgress />
          ) : (
            <div>No records found</div>
          )}
      </div>
    </>
  )
}