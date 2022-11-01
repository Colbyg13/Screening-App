import { Box, Button, Modal, TextField, Typography } from '@mui/material';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';

export default function RecordModal({
    record,
    record: {
        id,
    } = {},
    allFieldKeys = [],
    onClose,
}) {

    const [update, setUpdate] = useState({});

    useEffect(() => {
        setUpdate({});
    }, [record])

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
                        <div key={key} className="flex" >
                            <span className='w-40'>{_.startCase(key)}:</span>
                            <TextField
                                className='w-68'
                                size='small'
                                placeholder='Search'
                                style={{
                                    background: 'white',
                                }}
                                value={update[key] === undefined ? record?.[key] : update[key]}
                                onChange={({ target: { value } }) => setUpdate(update => ({ ...update, [key]: value }))}
                            />
                        </div>
                    ))}
                </div>
                <div className='w-full flex justify-between'>
                    <Button
                        size="small"
                        color="secondary"
                        variant="contained"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        size="small"
                        color="success"
                        variant="contained"
                        disabled={allFieldKeys.every(key => !update[key] || (record?.[key] === update[key]))}
                        onClick={async () => {
                            const result = await window.api.updateRecord({ id, ...update });
                            console.log({result, update})
                            onClose({id, ...update});
                        }}
                    >
                        Save
                    </Button>
                </div>
            </Box>
        </Modal>
    )
}
