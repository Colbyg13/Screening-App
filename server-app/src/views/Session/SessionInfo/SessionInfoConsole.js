import React, { useEffect, useRef, useState } from 'react';
import { USER_LOG_COLORS } from '../../../constants/log-types';
import { useSessionContext } from '../../../contexts/SessionContext';

export default function SessionInfoConsole() {
    const { sessionLogs = [] } = useSessionContext();
    const [autoScroll, setAutoScroll] = useState(true);
    const logContainerRef = useRef(null);

    useEffect(() => {
        if (autoScroll) {
            scrollToBottom();
        }
    }, [sessionLogs, autoScroll]);

    function scrollToBottom() {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }

    function handleScroll() {
        if (logContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = logContainerRef.current;
            const isScrolledToBottom = scrollHeight - scrollTop === clientHeight;
            setAutoScroll(isScrolledToBottom);
        }
    }

    return (
        <div className="max-h-full w-96 overflow-y-hidden bg-gray-900 text-gray-50">
            <h2 className="w-full pb-2 pt-8 text-xl text-center border-b border-gray-50">
                Session Console
            </h2>
            <div
                ref={logContainerRef}
                className="max-h-full overflow-y-auto pt-1 pb-40 px-4"
                onScroll={handleScroll}
            >
                {sessionLogs.map(({ log, type }, i) => (
                    <div key={i} className={USER_LOG_COLORS[type]}>
                        {log}
                    </div>
                ))}
            </div>
        </div>
    );
}
