import { Box, Button, Modal, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useCustomDataTypesContext } from '../../contexts/CustomDataContext';
import RecordModalInputRow from './RecordModalInputRow';

export default function RecordModal({
    record,
    record: {
        id,
    } = {},
    allFieldKeys = [],
    fieldKeyMap = {},
    onClose,
}) {

    const [update, setUpdate] = useState({});

    useEffect(() => {
        setUpdate({});
    }, [record]);

    return (
        <Modal
            open={!!record}
            onClose={() => onClose()}
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
                    Update Record
                </Typography>
                <div className='w-full p-4 space-y-2'>
                    <div className='text-xl'>id: {id}</div>
                    {allFieldKeys.filter(key => key !== 'id').map(key => (
                        <RecordModalInputRow
                            key={key}
                            fieldKey={key}
                            fieldKeyMap={fieldKeyMap}
                            update={update}
                            record={record}
                            onChange={newValue => setUpdate(update => ({ ...update, [key]: newValue }))}
                        />
                    ))}
                </div>
                <div className='w-full flex justify-between'>
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
                            const result = await window.api.updateRecord({ id, ...update });
                            console.log({ result, update })
                            onClose({ id, ...update });
                        }}
                    >
                        Save
                    </Button>
                </div>
            </Box>
        </Modal>
    )
}
