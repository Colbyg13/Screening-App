import { Box, Chip, Modal, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useSessionContext } from '../../../contexts/SessionContext';

export default function SessionSelectionModal({
    open,
    onClose,
}) {

    const {
        getSessionList,
        startSession,
    } = useSessionContext();

    const [loading, setLoading] = useState([]);
    const [sessionList, setSessionList] = useState([]);

    useEffect(() => {
        if (open) {
            setLoading(true);
            getSessionList()
                .then(sessionList => {
                    const sortedSessionList = sessionList.sort(({ createdAt: a }, { createdAt: b }) => a < b ? 1 : -1)
                    setSessionList(sortedSessionList);
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                })
        }
    }, [open]);

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '50%',
                bgcolor: 'background.paper',
                border: '2px solid #000',
                boxShadow: 24,
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                maxHeight: '80%',
                overflowY: 'auto',
            }}>
                <Typography id="modal-modal-title" variant="h6" component="h2">
                    Select a Previous Session
                </Typography>
                <div className='w-full space-y-2'>
                    {sessionList.map(({ _id, createdAt, generalFields }, i) => (
                        <div
                            className='relative w-full p-3 border rounded-lg cursor-pointer hover:bg-gray-100'
                            key={i}
                            onClick={() => startSession(_id)}
                        >
                            <div>Session: {createdAt.toLocaleString()}</div>
                            <div className='flex'>
                                {generalFields.map(({ name, value }) => (
                                    <Chip label={`${name}: ${value}`} variant="outlined" />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </Box>
        </Modal>
    )
}
