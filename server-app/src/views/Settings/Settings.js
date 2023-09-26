import { Button, TextField } from '@mui/material';
import React, { useState } from 'react'
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import { useSessionContext } from '../../contexts/SessionContext';

export default function Settings() {

    const [showModal, setShowModal] = useState(false);
    const { sessionIsRunning } = useSessionContext();

    return (
        <div className='flex w-full max-h-screen px-8 pt-8 pb-16 space-x-8 overflow-auto'>
            <ConfirmModal
                open={showModal}
                message="Are you sure you want to delete all records?"
                onClose={() => setShowModal(false)}
                onSubmit={window.api.deleteAllRecordsAndSessions}
                title="Delete All Records"
                actionText="Delete"
                deadmanText="delete"

            />
            <div className='py-4 px-8 w-full h-full bg-white rounded-md shadow-md'>
                <h2 className='text-2xl mb-4'>Settings</h2>
                <div className='flex space-x-2 items-center'>
                    <span className='text-lg'>Device Name</span>
                    <TextField
                        disabled
                        className='w-52'
                        size='small'
                        value="Admin"
                    />
                </div>
                <div>
                    <h2 className='text-xl mt-4 mb-2'>Developers</h2>
                    <div>Andrew Giles - andrewgiles@gilezapps.com</div>
                    <div>Colby Gardiner - colbygardiner13@gmail.com</div>
                </div>
                <div>
                    <h2 className='text-xl mt-4 mb-2 text-red-600'>Danger Zone</h2>
                    {sessionIsRunning ? (
                        <div className='text-red-600'>Cannot delete records while session is running.</div>
                    ) : null}
                    <Button
                        type="button"
                        size="large"
                        color="error"
                        variant="contained"
                        onClick={() => setShowModal(true)}
                        disabled={sessionIsRunning}
                    >
                        <span>Delete All Records</span>
                    </Button>
                </div>
            </div>
        </div >
    );
}
