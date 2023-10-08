import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import { Box, Chip, IconButton, Modal, Typography } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import ConfirmModal from '../../../components/ConfirmModal/ConfirmModal';
import { LOG_LEVEL } from '../../../constants/log-levels';
import { serverURL } from '../../../constants/server';
import { useSessionContext } from '../../../contexts/SessionContext';
import { useSnackBarContext } from '../../../contexts/SnackbarContext';

export default function SessionTemplateModal({
    open,
    onClose,
}) {

    const { addSnackBar } = useSnackBarContext();

    const {
        getSessionTemplates,
        openSessionTemplate,
    } = useSessionContext();

    const [templates, setTemplates] = useState([]);
    const [selectedTemplateIdToDelete, setSelectedTemplateIdToDelete] = useState();


    useEffect(() => {
        if (open) {
            reloadSessionTemplates();
        }
    }, [open]);

    function reloadSessionTemplates() {
        getSessionTemplates()
            .then((templates = []) => {
                const sortedTemplates = templates.sort(({ createdAt: a }, { createdAt: b }) => a < b ? 1 : -1)
                setTemplates(sortedTemplates);
            })
            .catch(err => {
                console.error(err);
            })
    }

    return (
        <>
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
                                className='relative flex justify-between w-full p-3 border rounded-md cursor-pointer hover:bg-gray-100'
                                onClick={() => {
                                    openSessionTemplate(template);
                                    onClose();
                                }}
                            >
                                <div>
                                    <div>Session: {template.name} ({template.createdAt?.toLocaleString()})</div>
                                    <div className='flex'>
                                        {template.sessionInfo?.generalFields.map(({ name, value }) => (
                                            <Chip key={name} label={`${name}: ${value}`} variant="outlined" />
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <IconButton onClick={e => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setSelectedTemplateIdToDelete(template._id);
                                    }}>
                                        <DeleteForeverOutlinedIcon style={{ color: 'red', width: 24 }} />
                                    </IconButton>
                                </div>
                            </div>
                        ))}
                    </div>
                </Box>
            </Modal>
            <ConfirmModal
                open={selectedTemplateIdToDelete !== undefined}
                title="Are you sure?"
                message="You will not be able to recover deleted templates"
                actionText="Delete"
                onClose={() => setSelectedTemplateIdToDelete()}
                onSubmit={async () => {
                    try {
                        await axios.delete(`${serverURL}/api/v1/sessionTemplates/${selectedTemplateIdToDelete}`);
                        addSnackBar({
                            title: 'Success',
                            message: `Session template successfully deleted`,
                            variant: 'success',
                            timeout: 2500,
                        });
                        setSelectedTemplateIdToDelete();
                        reloadSessionTemplates();
                    } catch (error) {
                        console.error("Could not delete session template.", error);
                        addSnackBar({
                            title: 'Error',
                            message: `Could not delete session template: ${error}`,
                            variant: 'danger',
                            timeout: 2500,
                        });
                        window.api.writeLog(LOG_LEVEL.ERROR, `Could not delete session template: ${error}`);
                    }
                }}
            />
        </>
    );
}
