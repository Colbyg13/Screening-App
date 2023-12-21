import { Box, Button, Modal, Typography } from '@mui/material'
import React from 'react'

export default function OfflineIdModal({ offlineId, onClose }) {
    return (
        <Modal
            open={offlineId !== undefined}
            onClose={() => onClose()}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box
                sx={{
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
                }}
            >
                <Typography id="modal-modal-title" variant="h6" component="h2">
                    Offline Record ID
                </Typography>
                <Typography id="modal-modal-body" variant="body1" component="span">
                    Your new offline id is {offlineId}.
                </Typography>
                <Typography id="modal-modal-body" variant="body2" component="span">
                    (If you forget your offline id, check out the records tab to see the newest id.)
                </Typography>
                <Button size="medium" color="inherit" variant="contained" onClick={onClose}>
                    OK
                </Button>
            </Box>
        </Modal>
    )
}
