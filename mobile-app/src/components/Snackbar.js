import { Snackbar as MuiSnackbar } from '@react-native-material/core';
import React, { useEffect } from 'react';
export const SNACKBAR_SEVERITIES = {
    SUCCESS: "success",
    ERROR: "error",
    INFO: "info",
    WARNING: "warning",
}

export default function Snackbar({
    open,
    onClose = () => {},
    message,
    severity,
    duration,
}) {
    useEffect(() => {
        if (open && duration) setTimeout(onClose, duration);
    }, [open]);

    const backgroundColor =
        severity === SNACKBAR_SEVERITIES.SUCCESS
            ? '#2E7D32'
            : severity === SNACKBAR_SEVERITIES.ERROR
              ? '#D32F2F'
              : severity === SNACKBAR_SEVERITIES.INFO
                ? '#0288D1'
                : severity === SNACKBAR_SEVERITIES.WARNING
                  ? '#ED6C02'
                  : '#323232';

    return open ? (
        <MuiSnackbar
            message={message}
            style={{
                backgroundColor,
                marginBottom: 5,
            }}
        />
    ) : null;
}
