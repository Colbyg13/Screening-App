import { Button, CircularProgress } from '@mui/material';
import React, { useEffect, useState } from 'react';
import RecordSearch from './RecordSearch';

export default function RecordTitleBar({
    unitConversions = {},
    updateSearch,
    allFieldKeys,
}) {

    const [downloading, setDownloading] = useState(false);
    const [totalRecordCount, setTotalRecordCount] = useState();

    useEffect(() => {
        window.api.getRecordCount()
            .then(count => setTotalRecordCount(count))
            .catch(err => console.error({ err }));
    }, []);

    return (
        <div className='pt-8 px-2 pb-2 bg-green-500 flex justify-between items-center'>
            <span className='flex items-baseline space-x-2'>
                <h2 className='ml-2 font-bold text-2xl'>
                    All Records
                </h2>
                <span>{totalRecordCount ? `(${totalRecordCount.toLocaleString()} total)` : ''}</span>
            </span>
            <RecordSearch
                updateSearch={updateSearch}
            />
            <Button
                size="small"
                color="inherit"
                variant="contained"
                type="button"
                disabled={downloading || !totalRecordCount}
                onClick={async () => {
                    console.log('DOWNLOADING')
                    const outputPath = window.api.showSaveDialog();
                    if (outputPath) {
                        setDownloading(true);
                        window.api.downloadRecords(outputPath, allFieldKeys, unitConversions)
                            .then(() => {
                                console.log('Download Complete');
                                setDownloading(false);
                                window.api.showMessage({ title: 'Download Complete', message: 'Your download is complete.', type: 'info' })
                            })
                            .catch(err => {
                                console.log({ err })
                                setDownloading(false);
                                window.api.showMessage({ title: 'Download Failed', message: 'Your download has failed to complete. Please try again.', type: 'error' })
                            })
                    }
                }}
            >
                {downloading ? (
                    <CircularProgress size={24} />
                ) : null}
                <span>Export</span>
            </Button>
        </div>
    )
}
