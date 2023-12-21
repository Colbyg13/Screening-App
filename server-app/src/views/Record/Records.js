import { CircularProgress } from '@mui/material';
import React from 'react';
import { useSessionContext } from '../../contexts/SessionContext';
import RecordList from './RecordList';
import RecordModal from './RecordModal';
import RecordsHeader from './RecordsHeader';
import RecordTitleBar from './RecordsTitleBar';
import useRecordsManager from './hooks/useRecordsManager';

export default function Records() {
    const { isConnectedToDB } = useSessionContext();
    const {
        sortedFieldKeys,
        allFields,
        fieldKeyMap,

        sort,
        mainSortKey,
        updateSortArray,

        search,
        updateSearch,

        unitConversions,
        updateFieldUnit,

        loadingRecords,
        atEndOfRecords,
        records,
        selectedRecord,
        selectRecord,
        updateRecord,
        deleteRecord,
        handleScroll,
        refreshRecords,
    } = useRecordsManager();

    return isConnectedToDB ? (
        <>
            <RecordModal
                record={selectedRecord}
                unitConversions={unitConversions}
                allFieldKeys={sortedFieldKeys}
                fieldKeyMap={fieldKeyMap}
                allFields={allFields}
                onClose={() => selectRecord()}
                onSave={updateRecord}
                onDelete={deleteRecord}
            />
            <div className="flex flex-col w-full h-full">
                <RecordTitleBar
                    unitConversions={unitConversions}
                    allFieldKeys={sortedFieldKeys}
                    updateSearch={updateSearch}
                    refreshRecords={refreshRecords}
                    loadingRecords={loadingRecords}
                />
                <div className="flex-grow w-full h-full relative">
                    {records.length ? (
                        <div
                            className="bg-white absolute inset-0 pb-32 overflow-y-auto"
                            onScroll={handleScroll}
                        >
                            <table className="w-full table-auto">
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
                                    fieldKeyMap={fieldKeyMap}
                                    allFieldKeys={sortedFieldKeys}
                                    handleRecordClick={selectRecord}
                                />
                            </table>
                            {loadingRecords ? <CircularProgress /> : null}
                            {atEndOfRecords ? (
                                <h3 className="w-full border-4 text-center text-lg">End of List</h3>
                            ) : null}
                        </div>
                    ) : loadingRecords ? (
                        <CircularProgress />
                    ) : (
                        <div>No records found</div>
                    )}
                </div>
            </div>
        </>
    ) : (
        <div className="absolute inset-0 flex flex-col justify-center items-center bg-red-500 text-white text-4xl">
            <div>COULD NOT LOAD RECORDS. PLEASE INSTALL MONGODB.</div>
            <div className="text-sky-300 underline">
                https://www.mongodb.com/try/download/community
            </div>
        </div>
    );
}
