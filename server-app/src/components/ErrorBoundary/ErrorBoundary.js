import React, { useEffect, useState } from 'react';
import { LOG_LEVEL } from '../../constants/log-levels';
import FallbackUI from './FallbackUI';

export default function ErrorBoundary({ children }) {
    const [error, setError] = useState('');
    const hasError = !!error;

    useEffect(() => {
        const handleError = error => {
            console.error('Error caught by error boundary:', error);
            window.api.writeLog(LOG_LEVEL.ERROR, `Error in react: ${error?.error?.stack}`);
            setError(error?.error?.message);
        };

        window.addEventListener('error', handleError);

        return () => {
            window.removeEventListener('error', handleError);
        };
    }, []);

    if (hasError) {
        return <FallbackUI error={error} />;
    }

    return children;
}
