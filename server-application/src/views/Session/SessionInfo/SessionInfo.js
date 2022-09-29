import { Button } from '@mui/material'
import React from 'react'
import { useSessionContext } from '../../../contexts/SessionContext'

export default function SessionInfo() {

    const { stopSession } = useSessionContext();

    return (
        <div className='h-full bg-gray-500'>
            Session Info
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
