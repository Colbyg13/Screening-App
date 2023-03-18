import { Box, Button, Modal, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useSessionContext } from '../../../contexts/SessionContext';

export default function SessionSaveTemplateModal({
    open,
    onClose,
}) {
    const {
        saveSessionTemplate,
    } = useSessionContext();

    const [name, setName] = useState("");

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box className='space-y-4' sx={{
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
                    Save Template
                </Typography>
                <div className='flex w-full justify-start'>
                    <span className='w-40'>Template Name:</span>
                    <TextField
                        className='w-52'
                        size='small'
                        value={name}
                        onChange={({ target: { value } }) => setName(value)}
                    />
                </div>
                <div className='w-full flex justify-end'>
                    <div className='flex space-x-2'>
                        <Button
                            size="small"
                            color="inherit"
                            variant="contained"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            size="small"
                            color="success"
                            variant="contained"
                            disabled={!name}
                            onClick={async () => {
                                await saveSessionTemplate({ name });
                                onClose();
                            }}
                        >
                            Save
                        </Button>
                    </div>
                </div>
            </Box>
        </Modal>
    );
}
