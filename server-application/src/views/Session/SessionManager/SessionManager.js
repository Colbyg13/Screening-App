import { Button } from '@mui/material';
import React from 'react';
import { useSessionContext } from '../../../contexts/SessionContext';
import StationManager from './StationManager';

export default function SessionManager() {

    const { startSession } = useSessionContext();

    return (
        <>
            <StationManager />
            <Button
                size="large"
                color="success"
                variant="contained"
                onClick={startSession}
                style={{
                    position: 'absolute',
                    bottom: 10,
                    right: 10,
                }}
            >
                Start Session
            </Button>
            {/* <div className="absolute bottom-2 left-4 text-sm">IPv4: {window.api.getIP()}</div> */}
        </>
    )
}
