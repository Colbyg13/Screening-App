import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import ErrorBoundary from 'react-native-error-boundary';
import ErrorFallback from './ErrorFallback';

export const ERROR_LOGS_STORAGE_KEY = 'error-logs';

export default function AppErrorBoundary({ children }) {
    const handleError = async (error, stackTrace) => {
        try {
            const errorLog = {
                timestamp: new Date().toISOString(),
                error: error.toString(),
                stackTrace: stackTrace.toString(),
            };

            const existingLogsJSON = await AsyncStorage.getItem(ERROR_LOGS_STORAGE_KEY);
            const existingLogs = existingLogsJSON ? JSON.parse(existingLogsJSON) : [];

            existingLogs.unshift(errorLog);

            await AsyncStorage.setItem(ERROR_LOGS_STORAGE_KEY, JSON.stringify(existingLogs));
        } catch (storageError) {
            console.error('Error storing error log:', storageError);
        }
    };

    return (
        <ErrorBoundary FallbackComponent={ErrorFallback} onError={handleError}>
            {children}
        </ErrorBoundary>
    );
}
