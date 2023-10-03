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
import { serverURL } from '../../constants/server';
import axios from 'axios';
import { LOG_LEVEL } from '../../constants/log-levels';

const recordPageSize = 100;

export default function Records() {

  const [isConnectedToDB, setIsConnectedToDB] = useState(false);
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
  const updateFieldUnit = (key, newUnit) => {
    setUnitConversions(unitConversions => ({
      ...unitConversions,
      [key]: newUnit,
    }));
    resetSkip();
  }

  useEffect(() => {
    getDBStatus();
  }, []);

  async function getDBStatus() {
    try {
      const isConnected = await window.api.getDBStatus();
      setIsConnectedToDB(isConnected);
    } catch (error) {
      console.error("Could not get db connection from context bridge", error);
    }
  }


  useEffect(() => {
    // used for getting our records from the database when sort or skip are updated
    if (!reachedEndOfRecords || !skip) {
      getRecords({ sort, skip, search, reachedEndOfRecords, unitConversions });

    }
  }, [sort, skip, search, reachedEndOfRecords, unitConversions]);

  async function getRecords({ sort, skip, search, reachedEndOfRecords, unitConversions }) {
    setLoading(true);
    try {
      const result = await axios.get(`${serverURL}/api/v1/records`, { params: { search, sort, skip, recordPageSize, unitConversions } });
      console.log({ result });
      const records = result.data;

      if (records.length) {
        if (reachedEndOfRecords) setReachedEndOfRecords(false);

        // only include the previous if skip is not 0
        setRecords(previousRecords => skip === 0 ? records : [...previousRecords, records]);
      } else {
        setReachedEndOfRecords(true);
      }
    } catch (error) {
      console.error("Could not get records from server", error);
      window.api.writeLog(LOG_LEVEL.ERROR, `Could not get records from server: ${error}`);
    } finally {
      setLoading(false);
    }
  }

  function handleScroll(e) {

    const {
      target: {
        scrollHeight,
        clientHeight,
        scrollTop,
      } = {},
    } = e;

    const margin = 100;
    // loads more when reaching the end of the page
    const bottom = scrollHeight - scrollTop - margin <= clientHeight;
    if (!loading && bottom) setSkip(skip => skip + recordPageSize);
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
    setSelectedRecord();
  }

  function handleDelete(recordId) {
    if (recordId) setRecords(records => records.filter(({ id }) => id !== recordId))
    setSelectedRecord();
  }



  return isConnectedToDB ? (
    <>
      <RecordModal
        record={selectedRecord}
        unitConversions={unitConversions}
        allFieldKeys={sortedFieldKeys}
        fieldKeyMap={fieldKeyMap}
        allFields={allFields}
        onClose={handleOnClose}
        onSave={handleModalSave}
        onDelete={handleDelete}
      />
      <div className='flex flex-col w-full h-full'>
        <RecordTitleBar
          unitConversions={unitConversions}
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
  ) : (
    <div className='absolute inset-0 flex flex-col justify-center items-center bg-red-500 text-white text-4xl'>
      <div>COULD NOT LOAD RECORDS. PLEASE INSTALL MONGODB.</div>
      <div className='text-sky-300 underline'>https://www.mongodb.com/try/download/community</div>
    </div>
  );
}