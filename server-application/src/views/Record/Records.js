import { CircularProgress } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { useCustomDataTypesContext } from '../../contexts/CustomDataContext';
import replace from '../../utils/replace';
import useFieldKeys from './hooks/useFieldKeys';
import useFieldSort from './hooks/useFieldSort';
import RecordList from './RecordList';
import RecordModal from './RecordModal';
import RecordsHeader from './RecordsHeader';
import RecordTitleBar from './RecordsTitleBar';

const recordPageSize = 100;

export default function Records() {

  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [skip, setSkip] = useState(0);
  const [reachedEndOfRecords, setReachedEndOfRecords] = useState(false);
  const { customDataTypeMap } = useCustomDataTypesContext();
  const { allFields, allFieldKeys, fieldKeyMap, sortedFieldKeys } = useFieldKeys();
  const resetSkip = () => setSkip(0);
  const { updateSortArray, mainSortKey, sort } = useFieldSort({ allFieldKeys, resetSkip });
  const [search, setSearch] = useState('');
  const [selectedRecord, setSelectedRecord] = useState();
  const initialUnitConversions = allFields
    .filter(({ type }) => type && customDataTypeMap[type] && (customDataTypeMap[type] !== 'Custom'))
    .reduce((all, { key, type }) => ({
      ...all,
      [key]: customDataTypeMap[type],
    }), {});
  const [unitConversions, setUnitConversions] = useState(initialUnitConversions);
  const updateFieldUnit = (key, newUnit) => setUnitConversions(unitConversions => ({
    ...unitConversions,
    [key]: newUnit,
  }));

  useEffect(() => {
    // used for getting our records from the database when sort or skip are updated
    if (!reachedEndOfRecords || !skip) {
      setLoading(true);
      // console.log({ sort, skip, search })
      window.api.getRecords(search, sort, skip, recordPageSize, unitConversions)
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
  }, [sort, skip, search, reachedEndOfRecords, unitConversions]);

  function handleScroll(e) {
    // loads more when reaching the end of the page
    const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
    if (bottom) setSkip(skip => skip + recordPageSize);
  }

  function updateSearch(newSearch) {
    setSearch(newSearch);
    resetSkip();
  }

  function handleRecordClick(record) {
    setSelectedRecord(record);
  }

  function handleOnClose() {
    setSelectedRecord();
  }

  function handleModalSave(update) {
    if (update) setRecords(records => {
      const oldRecord = records.find(({ id }) => id === update.id);
      if (oldRecord) return replace(records, records.indexOf(oldRecord), { ...oldRecord, ...update })
    })
  }

  return (
    <>
      <RecordModal
        record={selectedRecord}
        allFieldKeys={sortedFieldKeys}
        fieldKeyMap={fieldKeyMap}
        allFields={allFields}
        onClose={handleOnClose}
        onSave={handleModalSave}
      />
      <div className='flex flex-col w-full h-full'>
        <RecordTitleBar
          allFieldKeys={sortedFieldKeys}
          updateSearch={updateSearch}
        />
        <div className='flex-grow w-full h-full relative'>
          {records.length ? (
            <div className='bg-white absolute inset-0 pb-32 overflow-y-auto'
              onScroll={handleScroll}
            >
              <table className='w-full table-auto'>
                <RecordsHeader
                  mainSortKey={mainSortKey}
                  allFieldKeys={sortedFieldKeys}
                  fieldKeyMap={fieldKeyMap}
                  unitConversions={unitConversions}
                  updateSortArray={updateSortArray}
                  updateFieldUnit={updateFieldUnit}
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
      </div>
    </>
  )
}