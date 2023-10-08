import { Box, Button, Modal, Typography } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import { LOG_LEVEL } from '../../constants/log-levels';
import { serverURL } from '../../constants/server';
import { useCustomDataTypesContext } from '../../contexts/CustomDataContext';
import { useSessionContext } from '../../contexts/SessionContext';
import { useSnackBarContext } from '../../contexts/SnackbarContext';
import RecordModalInputRow from './RecordModalInputRow';

export default function RecordModal({
    record,
    record: {
        id,
    } = {},
    unitConversions = {},
    allFields = [],
    allFieldKeys = [],
    fieldKeyMap = {},
    onClose = () => { },
    onSave = () => { },
    onDelete = () => { },
}) {

    const { addSnackBar } = useSnackBarContext();

    const [confirmDelete, setConfirmDelete] = useState(false);
    const [update, setUpdate] = useState({});
    const { customDataTypes } = useCustomDataTypesContext();
    const { sessionIsRunning } = useSessionContext();


    useEffect(() => {
        setUpdate({});
    }, [record]);

    return (
        <Modal
            open={!!record}
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
                <ConfirmModal
                    open={confirmDelete}
                    title="Delete Record"
                    message="Are you sure you want to delete this record?"
                    actionText="Delete"
                    onClose={() => setConfirmDelete(false)}
                    onSubmit={async () => {
                        try {
                            await axios.delete(`${serverURL}/api/v1/records/${id}`);
                            addSnackBar({
                                title: 'Success',
                                message: `Record deleted`,
                                variant: 'success',
                                timeout: 2500,
                            });
                            onDelete(id);
                        } catch (error) {
                            console.error("Could not delete record.", error);
                            window.api.writeLog(LOG_LEVEL.ERROR, `Could not delete record: ${error}`);
                            addSnackBar({
                                title: 'Error',
                                message: `Could not delete record: ${error}`,
                                variant: 'danger',
                                timeout: 2500,
                            });
                        }
                    }}
                />
                <Typography id="modal-modal-title" variant="h6" component="h2">
                    Update Record
                </Typography>
                <div className='w-full p-4 space-y-2'>
                    <div className='text-xl'>id: {id}</div>
                    {allFieldKeys.filter(key => key !== 'id').map(key => (
                        <RecordModalInputRow
                            key={key}
                            fieldKey={key}
                            unitConversions={unitConversions}
                            fieldKeyMap={fieldKeyMap}
                            update={update}
                            record={record}
                            onChange={newValue => setUpdate(update => ({ ...update, [key]: newValue }))}
                        />
                    ))}
                </div>
                <div className='w-full flex justify-between'>
                    <div className='flex space-x-2'>
                        <Button
                            size="small"
                            color="error"
                            variant="contained"
                            onClick={() => setConfirmDelete(true)}
                            disabled={sessionIsRunning}
                        >
                            Delete
                        </Button>
                        {sessionIsRunning ? (
                            <div className='text-red-600'>Please stop the session to delete record</div>
                        ) : null}
                    </div>
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
                            disabled={allFieldKeys.every(key => update[key] === undefined || (record?.[key] === update[key]))}
                            onClick={async () => {

                                const customDataToUpdate = customDataTypes.reduce((customData, { type, unit }) => {
                                    const usedField = allFields.find(field => field.type === type);
                                    const shouldAddKey = (
                                        (unit !== 'Custom')
                                        &&
                                        usedField
                                        &&
                                        (update[usedField.key] !== undefined)
                                    );

                                    return shouldAddKey ?
                                        {
                                            ...customData,
                                            [usedField.key]: unitConversions[usedField.key],
                                        }
                                        :
                                        customData;
                                }, {});

                                const payload = {
                                    record: { id, sessionId: record.sessionId, ...update },
                                    customData: customDataToUpdate,
                                }

                                try {
                                    await axios.post(`${serverURL}/api/v1/records`, payload);
                                    addSnackBar({
                                        title: 'Success',
                                        message: `Record updated`,
                                        variant: 'success',
                                        timeout: 2500,
                                    });
                                    onSave(payload.record);
                                } catch (error) {
                                    console.error("Could not update record.", error);
                                    window.api.writeLog(LOG_LEVEL.ERROR, `Could not update record: ${error}`);
                                    addSnackBar({
                                        title: 'Error',
                                        message: `Could not update record: ${error}`,
                                        variant: 'danger',
                                        timeout: 2500,
                                    });
                                }
                            }}
                        >
                            Save
                        </Button>
                    </div>
                </div>
            </Box>
        </Modal >
    )
}
