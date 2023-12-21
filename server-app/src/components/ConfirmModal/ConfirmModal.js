import { Box, Button, CircularProgress, Modal, TextField, Typography } from '@mui/material'
import React, { useState } from 'react'

export default function ConfirmModal({
    open,
    title,
    message,
    actionText,
    deadmanText, // if provided will be a deadman's switch
    onClose,
    onSubmit,
}) {
    const [input, setInput] = useState('')
    const canPerformAction = !deadmanText || input === deadmanText
    const [loading, setLoading] = useState(false)

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    // width: '50%',
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
                    {title}
                </Typography>
                <div className="text-lg">{message}</div>
                {deadmanText ? (
                    <div className="w-full p-4 space-y-2">
                        <div className="text-lg">Type in "{deadmanText}" in order to continue</div>
                        <TextField
                            placeholder={deadmanText}
                            className="w-52"
                            size="small"
                            value={input}
                            onChange={({ target: { value } }) => setInput(value)}
                        />
                    </div>
                ) : null}
                <div className="w-full flex justify-between">
                    <Button size="medium" color="inherit" variant="contained" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        size="medium"
                        color="error"
                        variant="contained"
                        disabled={!canPerformAction}
                        onClick={async () => {
                            setLoading(true)
                            await onSubmit()
                            setLoading(false)
                            onClose()
                        }}
                    >
                        {loading ? <CircularProgress size={24} /> : null}
                        {actionText}
                    </Button>
                </div>
            </Box>
        </Modal>
    )
}
