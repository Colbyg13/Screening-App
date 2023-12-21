import React, { useEffect } from 'react'
import { Snackbar as MuiSnackbar } from '@react-native-material/core'
//displays an error or success message throughout the app.
export default function Snackbar({
    open,
    onClose = () => {},
    message,
    severity,
    duration,
    action,
}) {
    useEffect(() => {
        if (open && duration) setTimeout(onClose, duration)
    }, [open])

    const backgroundColor =
        severity === 'success'
            ? '#2E7D32'
            : severity === 'error'
              ? '#D32F2F'
              : severity === 'info'
                ? '#0288D1'
                : severity === 'warning'
                  ? '#ED6C02'
                  : '#323232'

    return open ? (
        <MuiSnackbar
            action={action}
            message={message}
            style={{
                position: 'absolute',
                zIndex: 99,
                bottom: 16,
                start: 16,
                end: 16,
                backgroundColor,
            }}
        />
    ) : null
}
