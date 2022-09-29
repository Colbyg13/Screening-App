import React from 'react'
import { useSessionContext } from '../../../contexts/SessionContext'

export default function SessionInfoConsole() {

  const { sessionLogs } = useSessionContext();

  return (
    <div className='w-96 bg-gray-900 py-8 text-gray-50'>
      <h2 className='w-full pb-2 text-xl text-center border-b border-gray-50'>Session Console</h2>
      {sessionLogs.map(({ msg, type }) => (
        <div>{msg}</div>
      ))}
    </div>
  )
}
