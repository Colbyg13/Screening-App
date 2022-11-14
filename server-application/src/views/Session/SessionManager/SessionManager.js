import { Button } from '@mui/material';
import React, { useState } from 'react';
import { useSessionContext } from '../../../contexts/SessionContext';
import SessionSelectionModal from './SessionSelectionModal';
import StationManager from './StationManager';

export default function SessionManager() {

    const { startSession } = useSessionContext();
    const [openSessionModal, setOpenSessionModal] = useState(false);

    return (
        <form
            onSubmit={e => {
                e.preventDefault();
                startSession();
            }}
        >
            <SessionSelectionModal
                open={openSessionModal}
                onClose={() => setOpenSessionModal(false)}
            />
            <StationManager />
            <div className='absolute bottom-4 right-8 space-x-4 flex'>
                <Button
                    type='button'
                    size="large"
                    color="warning"
                    variant="contained"
                    onClick={() => setOpenSessionModal(true)}
                >
                    Resume Session
                </Button>
                <Button
                    type='submit'
                    size="large"
                    color="success"
                    variant="contained"
                >
                    Start Session
                </Button>
            </div>
        </form>
    )
}
