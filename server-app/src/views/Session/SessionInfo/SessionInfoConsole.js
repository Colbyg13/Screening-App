import React from 'react'
import { USER_LOG_COLORS } from '../../../constants/log-types';
import { useSessionContext } from '../../../contexts/SessionContext'

export default function SessionInfoConsole() {

  const { sessionLogs = [] } = useSessionContext();

  return (
    <div className='max-h-full w-96 overflow-y-hidden bg-gray-900 text-gray-50'>
      <h2 className='w-full pb-2 pt-8 text-xl text-center border-b border-gray-50'>Session Console</h2>
      <div className='max-h-full overflow-y-auto pt-1 pb-40 px-4'>
        {sessionLogs.map(({ log, type }, i) => (
          <div key={i} className={USER_LOG_COLORS[type]}>{log}</div>
        ))}
      </div>
    </div>
  )
}
