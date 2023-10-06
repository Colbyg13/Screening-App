import { Button } from '@mui/material';
import axios from 'axios';
import React, { useState } from 'react';
import { LOG_LEVEL } from '../../../constants/log-levels';
import { serverURL } from '../../../constants/server';
import { useSessionContext } from '../../../contexts/SessionContext';
import OfflineIdModal from './OfflineIdModal';
import SessionInfoConsole from './SessionInfoConsole';
import StationInfoList from './StationInfoList';

export default function SessionInfo() {

    const { stopSession, sessionId } = useSessionContext();
    const [offlineId, setOfflineId] = useState();

    async function getNextOfflineId() {
        try {
            console.log({ sessionId })
            const result = await axios.post(`${serverURL}/api/v1/records`, {
                record: {
                    sessionId,
                },
            });
            console.log({ result })
            const offlineId = result.data.id;
            setOfflineId(offlineId);
        } catch (error) {
            console.error("Could get new offline id.", error);
            window.api.writeLog(LOG_LEVEL.ERROR, `Could get new offline id: ${error}`);
        }
    }

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
                    onClick={getNextOfflineId}
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
