import { Button, CircularProgress, IconButton } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { LOG_LEVEL } from '../../constants/log-levels';
import { serverURL } from '../../constants/server';
import { useSnackBarContext } from '../../contexts/SnackbarContext';
import RecordSearch from './RecordSearch';
import RefreshIcon from '@mui/icons-material/Refresh';

export default function RecordTitleBar({
    unitConversions = {},
    updateSearch,
    allFieldKeys,
    loadingRecords,
    refreshRecords = () => {},
}) {
    const { addSnackBar } = useSnackBarContext();

    const [displayRefresh, setDisplayRefresh] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [totalRecordCount, setTotalRecordCount] = useState();

    useEffect(() => {
        if (!refreshing && displayRefresh && loadingRecords) {
            setRefreshing(true);
            setTimeout(() => {
                setRefreshing(false);
            }, 1000);
        }
    }, [loadingRecords, displayRefresh, refreshing]);

    useEffect(() => {
        getRecordCount();
    }, []);

    async function getRecordCount() {
        try {
            const result = await axios.get(`${serverURL}/api/v1/records`, {
                params: { getCount: true },
            });
            setTotalRecordCount(result.data);
        } catch (error) {
            console.error('Could not get records from server', error);
            addSnackBar({
                title: 'Error',
                message: `Could not get records from server: ${error}`,
                variant: 'danger',
                timeout: 2500,
            });
            window.api.writeLog(LOG_LEVEL.ERROR, `Could not get records from server: ${error}`);
        }
    }

    return (
        <div className="pt-8 px-2 pb-2 bg-green-500 flex justify-between items-center">
            <span className="flex items-baseline space-x-2">
                <h2 className="ml-2 font-bold text-2xl">All Records</h2>
                <span>
                    {totalRecordCount ? `(${totalRecordCount.toLocaleString()} total)` : ''}
                </span>
                <button
                    className="px-1 pb-0.5 bg-gray-200 hover:bg-gray-50 shadow-lg hover:shadow-xl transition-colors duration-200 rounded-md cursor-pointer"
                    type="button"
                    onClick={() => {
                        setDisplayRefresh(true);
                        refreshRecords();
                    }}
                >
                    <RefreshIcon
                        className={refreshing ? 'animate-spin' : ''}
                        style={{ color: 'black', width: 20, height: 20 }}
                    />
                </button>
            </span>
            <RecordSearch updateSearch={updateSearch} />
            <Button
                size="small"
                color="inherit"
                variant="contained"
                type="button"
                disabled={downloading || !totalRecordCount}
                onClick={() => {
                    try {
                        const outputPath = window.api.showSaveDialog();
                        if (outputPath) {
                            setDownloading(true);
                            window.api
                                .downloadRecords(outputPath, allFieldKeys, unitConversions)
                                .then(() => {
                                    setDownloading(false);
                                    window.api.showMessage({
                                        title: 'Download Complete',
                                        message: 'Your download is complete.',
                                        type: 'info',
                                    });
                                    window.api.openFile(outputPath);
                                })
                                .catch(err => {
                                    setDownloading(false);
                                    window.api.showMessage({
                                        title: 'Download Failed',
                                        message: `Your download has failed to complete. ${err}`,
                                        type: 'error',
                                    });
                                });
                        }
                    } catch (error) {
                        console.error('Could not download records', error);
                    }
                }}
            >
                {downloading ? <CircularProgress size={24} /> : null}
                <span>Export</span>
            </Button>
        </div>
    );
}
