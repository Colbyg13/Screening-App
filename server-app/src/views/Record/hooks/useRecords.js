import axios from 'axios';
import { useEffect, useState } from "react";
import { LOG_LEVEL } from '../../../constants/log-levels';
import { serverURL } from "../../../constants/server";
import replace from '../../../utils/replace';

export default function useRecords({ sort, search, unitConversions, dependenciesLoaded }) {

    const [page, setPage] = useState(0);

    const [loading, setLoading] = useState(true);
    const [records, setRecords] = useState([]);
    const [atEndOfRecords, setAtEndOfRecords] = useState(false);

    const [freshLoad, setFreshLoad] = useState(true);

    const [selectedRecord, setSelectedRecord] = useState();

    useEffect(() => {
        setPage(0);
        setFreshLoad(true);
    }, [sort, search, unitConversions]);

    useEffect(() => {
        if (dependenciesLoaded && freshLoad) {
            getRecords();
            setFreshLoad(false);
        }
    }, [dependenciesLoaded, freshLoad]);

    function getNextPage() {
        setPage(page => page + 1);
    }

    async function getRecords() {
        setLoading(true);
        try {
            const result = await axios.get(`${serverURL}/api/v1/records`, {
                params: {
                    search: search ?? undefined,
                    sort,
                    page,
                    unitConversions,
                }
            });
            const records = result.data;

            if (records.length) {
                // only include the previous if page is not 0
                setRecords(previousRecords => page === 0 ? records : [...previousRecords, records]);
                setAtEndOfRecords(false);
            } else {
                setAtEndOfRecords(true);
            }
        } catch (error) {
            console.error("Could not get records from server", error);
            window.api.writeLog(LOG_LEVEL.ERROR, `Could not get records from server: ${error}`);
        } finally {
            setLoading(false);
        }
    }

    function selectRecord(record) {
        setSelectedRecord(record);
    }

    function updateRecord(update) {

        if (update) setRecords(records => {
            // update state instead of requerying
            const oldRecord = records.find(({ id }) => id === update.id);
            if (oldRecord) return replace(records, records.indexOf(oldRecord), { ...oldRecord, ...update })
        })
        setSelectedRecord();
    }

    function deleteRecord(recordId) {
        if (recordId) setRecords(records => records.filter(({ id }) => id !== recordId))
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
    }
}
