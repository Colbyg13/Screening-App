import { Button } from '@mui/material';
import React, { useState } from 'react';
import { useSessionContext } from '../../../contexts/SessionContext';
import OfflineIdModal from './OfflineIdModal';
import SessionInfoConsole from './SessionInfoConsole';
import StationInfoList from './StationInfoList';

export default function SessionInfo() {

    const { stopSession } = useSessionContext();
    const [offlineId, setOfflineId] = useState();

    return (
        <div className='flex h-screen'>
            <OfflineIdModal
                offlineId={offlineId}
                onClose={() => setOfflineId()}
            />
            <StationInfoList />
            <SessionInfoConsole />
            <div className='absolute bottom-4 right-4 space-x-4 flex'>
                <Button
                    size="large"
                    color="primary"
                    variant="contained"
                    onClick={async () => {
                        const { newId: offlineId } = await window.api.createRecord();
                        setOfflineId(offlineId);
                    }}
                >
                    Next Offline ID
                </Button>
                <Button
                    size="large"
                    color="error"
                    variant="contained"
                    onClick={stopSession}
                >
                    Finish Session
                </Button>
            </div>
        </div>
    )
}
