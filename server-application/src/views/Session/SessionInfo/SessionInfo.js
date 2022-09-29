import { Button } from '@mui/material'
import React from 'react'
import { useSessionContext } from '../../../contexts/SessionContext'
import StationInfo from './StationInfo';
import StationInfoList from './StationInfoList';

export default function SessionInfo() {

    const { stopSession } = useSessionContext();

    return (
        <div className='h-full'>
            <StationInfoList />
            <Button
                size="large"
                color="error"
                variant="contained"
                onClick={stopSession}
                style={{
                    position: 'absolute',
                    bottom: 16,
                    right: 32,
                }}
            >
                Finish Session
            </Button>
        </div>
    )
}
