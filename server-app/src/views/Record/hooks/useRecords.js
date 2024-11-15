import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { LOG_LEVEL } from '../../../constants/log-levels';
import { serverURL } from '../../../constants/server';
import { useSnackBarContext } from '../../../contexts/SnackbarContext';

export default function useRecords({ sort, search, unitConversions, dependenciesLoaded }) {
    const { addSnackBar } = useSnackBarContext();

    const [cancelTokenSource, setCancelTokenSource] = useState(null);
    const recordBlockRef = useRef(false);
    const pageRef = useRef(0);

    const [loading, setLoading] = useState(true);
    const [records, setRecords] = useState([]);
    const [atEndOfRecords, setAtEndOfRecords] = useState(false);

    const [selectedRecord, setSelectedRecord] = useState();

    useEffect(() => {
        refreshRecords();
    }, [sort, search, unitConversions]);

    function refreshRecords() {
        getRecords(0);
        pageRef.current = 0;
    }

    async function getNextPage() {
        if (!recordBlockRef.current) {
            pageRef.current += 1;
            recordBlockRef.current = true;
            await getRecords(pageRef.current);
            recordBlockRef.current = false;
        }
    }

    async function getRecords(page) {
        if (!dependenciesLoaded) return;

        setLoading(true);

        // cancel precious requests
        if (cancelTokenSource) {
            cancelTokenSource.cancel('Request canceled due to a new request');
        }

        const newCancelTokenSource = axios.CancelToken.source();
        setCancelTokenSource(newCancelTokenSource);

        try {
            const result = await axios.get(`${serverURL}/api/v1/records`, {
                params: {
                    search: search ?? undefined,
                    sort,
                    page,
                    unitConversions,
                },
            });
            if (result.data) {
                const records = result.data;

                if (records.length) {
                    // only include the previous if page is not 0
                    setRecords(previousRecords =>
                        page === 0 ? records : [...previousRecords, ...records],
                    );
                    setAtEndOfRecords(false);
                } else {
                    setAtEndOfRecords(true);
                }
            } else {
                setAtEndOfRecords(true);
            }
        } catch (error) {
            console.error('Could not get records from server', error);
            addSnackBar({
                title: 'Error',
                message: `Could not get records from server: ${error}`,
                variant: 'danger',
                timeout: 2500,
            });
            window.api.writeLog(LOG_LEVEL.ERROR, `Could not get records from server: ${error}`);
        } finally {
            setLoading(false);
        }
    }

    function selectRecord(record) {
        setSelectedRecord(record);
    }

    function updateRecord(update) {
        if (update)
            setRecords(records => {
                // update state instead of requerying
                const oldRecordIndex = records.findIndex(({ id }) => id === update.id);
                if (oldRecordIndex >= 0)
                    return records.with(oldRecordIndex, {
                        ...records[oldRecordIndex],
                        ...update,
                    });
            });
        setSelectedRecord();
    }

    function deleteRecord(recordId) {
        if (recordId) setRecords(records => records.filter(({ id }) => id !== recordId));
        setSelectedRecord();
    }

    return {
        loading,
        atEndOfRecords,
        records,
        selectedRecord,
        getNextPage,
        selectRecord,
        updateRecord,
        deleteRecord,
        refreshRecords,
    };
}
