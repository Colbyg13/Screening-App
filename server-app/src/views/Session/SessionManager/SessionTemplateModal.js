import { Box, Chip, Modal, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react'
import { useSessionContext } from '../../../contexts/SessionContext';

export default function SessionTemplateModal({
    open,
    onClose,
}) {
    const {
        getSessionTemplates,
        openSessionTemplate,
    } = useSessionContext();

    const [templates, setTemplates] = useState([]);

    useEffect(() => {
        if (open) {
            getSessionTemplates()
                .then(templates => {
                    const sortedTemplates = templates.sort(({ createdAt: a }, { createdAt: b }) => a < b ? 1 : -1)
                    setTemplates(sortedTemplates);
                })
                .catch(err => {
                    console.error(err);
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
                    Select a Template to Load
                </Typography>
                <div className='w-full space-y-2'>
                    {templates.map(template => (
                        <div
                            key={template._id}
                            className='relative w-full p-3 border rounded-md cursor-pointer hover:bg-gray-100'
                            onClick={() => {
                                openSessionTemplate(template);
                                onClose();
                            }}
                        >
                            <div>Session: {template.name} ({template.createdAt.toLocaleString()})</div>
                            <div className='flex'>
                                {template.sessionInfo?.generalFields.map(({ name, value }) => (
                                    <Chip key={name} label={`${name}: ${value}`} variant="outlined" />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </Box>
        </Modal>
    );
}
