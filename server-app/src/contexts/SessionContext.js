import axios from 'axios'
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { io } from 'socket.io-client'
import { LOG_LEVEL } from '../constants/log-levels'
import LOG_TYPES from '../constants/log-types'
import {
    ALL_REQUIRED_STATION_FIELDS,
    REQUIRED_DB_FIELDS,
} from '../constants/required-station-fields'
import { serverURL } from '../constants/server'
import replace from '../utils/replace'
import { useSnackBarContext } from './SnackbarContext'

const SessionContext = createContext({
    socket: null,
    sessionIsRunning: false,
    sessionId: null,
    sessionInfo: {},
    sessionLogs: [],
    getSessionList: () => {},
    getSessionTemplates: () => {},
    openSessionTemplate: () => {},
    saveSessionTemplate: () => {},
    startSession: () => {},
    stopSession: () => {},
    addStation: () => {},
    deleteStation: () => {},
    addField: () => {},
    updateField: () => {},
    deleteField: () => {},
})

export const useSessionContext = () => useContext(SessionContext)

const sessionInfoStorageKey = 'sessionInfo'

const initialSystemInfo = {
    generalFields: [
        {
            name: '',
            value: '',
        },
    ],
    stations: [
        {
            id: 1,
            name: 'Station 1',
            fields: [
                {
                    name: '',
                    type: '',
                },
            ],
        },
    ],
}

export default function SessionProvider({ children }) {
    /**
     * Allows our application to see if we are currently in a session.
     * The user should be able to use the whole application while the session is going
     * (it should not cut the session when the view leaves)
     */

    const { addSnackBar } = useSnackBarContext()

    const [isConnectedToDB, setIsConnectedToDB] = useState(true)

    const [socket, setSocket] = useState(null)

    const [sessionIsRunning, setSessionIsRunning] = useState(false)
    const [sessionId, setSessionId] = useState(null)

    const [sessionInfo, setSessionInfo] = useState(
        JSON.parse(localStorage.getItem(sessionInfoStorageKey)) || initialSystemInfo,
    )
    const [sessionLogs, setSessionLogs] = useState([])

    const [connectedUsers, setConnectedUsers] = useState([])

    const connectedUsersByStation = useMemo(
        () =>
            connectedUsers.reduce(
                (connectedUsersByStation, user) => ({
                    ...connectedUsersByStation,
                    [user.stationId]: [...(connectedUsersByStation[user.stationId] || []), user],
                }),
                {},
            ),
        [connectedUsers],
    )

    useEffect(() => {
        if (sessionId !== null) {
            getSessionInfo(sessionId)
        } else {
            setSessionLogs([])
            setConnectedUsers(users =>
                users.map(user => ({
                    ...user,
                    stationId: undefined,
                })),
            )
        }
    }, [sessionId])

    // Updates local storage when sessionInfo is updated
    useEffect(() => {
        localStorage.setItem(sessionInfoStorageKey, JSON.stringify(sessionInfo))
    }, [sessionInfo])

    useEffect(() => {
        getDBStatus()
    }, [])

    useEffect(() => {
        const socket = io(serverURL, {
            auth: { username: 'Computer', isAdmin: true },
        })

        setSocket(socket)

        socket.on('connect', () => {
            addSessionLog('You are connected to the session')
        })

        socket.on('session-info', data => {
            const { sessionIsRunning, sessionId } = data

            setSessionIsRunning(sessionIsRunning)
            setSessionId(sessionId)
        })

        socket.on('record-created', createdRecord => {
            addSessionLog(
                `record created with id: ${createdRecord.id}, name: ${createdRecord.name ?? ''}`,
                LOG_TYPES.RECORD_CREATED,
            )
        })

        socket.on('station-join', data => {
            addSessionLog(
                `User ${data.username} joined station ${data.stationId}`,
                LOG_TYPES.JOIN_STATION,
            )
            setConnectedUsers(users =>
                users.map(user =>
                    user.userId === data.userId
                        ? {
                              ...user,
                              stationId: data.stationId,
                          }
                        : user,
                ),
            )
        })

        socket.on('station-leave', data => {
            addSessionLog(`User ${data.username} left their station`, LOG_TYPES.LEAVE_STATION)
            setConnectedUsers(users =>
                users.map(user =>
                    user.userId === data.userId
                        ? {
                              ...user,
                              stationId: undefined,
                          }
                        : user,
                ),
            )
        })

        socket.on('user-connected', newUser => {
            addSessionLog(`User ${newUser.username} connected to server`, LOG_TYPES.CONNECTED)
            setConnectedUsers(users => [...users, newUser])
        })

        socket.on('user-disconnect', user => {
            addSessionLog(`User ${user.username} disconnected server`, LOG_TYPES.DISCONNECTED)
            setConnectedUsers(users => users.filter(({ userId }) => user.userId !== userId))
        })

        socket.on('users', data => {
            setConnectedUsers(data)
        })

        return () => {
            socket.disconnect()
        }
    }, [])

    async function getDBStatus() {
        try {
            const isConnected = await window.api.getDBStatus()
            setIsConnectedToDB(isConnected)
        } catch (error) {
            console.error('Could not get db connection from context bridge', error)
            setIsConnectedToDB(false)
        }
    }

    function addSessionLog(log, type = LOG_TYPES.GENERAL) {
        setSessionLogs(logs => [...(logs.length > 500 ? logs.slice(1) : logs), { log, type }])
    }

    function addStation() {
        setSessionInfo(sessionInfo => ({
            ...sessionInfo,
            stations: [
                ...sessionInfo.stations,
                {
                    name: `Station ${sessionInfo.stations.length + 1}`,
                    id: sessionInfo.stations.length + 1,
                    fields: [{ name: '', type: '' }],
                },
            ],
        }))
    }

    function deleteStation(index) {
        //General Fields
        if (index === undefined) throw new Error('Cannot delete general fields')
        //Stations
        else
            setSessionInfo(sessionInfo => ({
                ...sessionInfo,
                stations: sessionInfo.stations
                    .filter((_, i) => i !== index)
                    .map((station, i) => ({
                        ...station,
                        id: i + 1,
                        name: `Station ${i + 1}`,
                    })),
            }))
    }

    function addField(stationIndex) {
        // General Field
        if (stationIndex === undefined)
            setSessionInfo(sessionInfo => ({
                ...sessionInfo,
                generalFields: [...sessionInfo.generalFields, { name: '', value: '' }],
            }))
        // Station Field
        else
            setSessionInfo(sessionInfo => ({
                ...sessionInfo,
                stations: replace(sessionInfo.stations, stationIndex, {
                    ...sessionInfo.stations[stationIndex],
                    fields: [...sessionInfo.stations[stationIndex].fields, { name: '', type: '' }],
                }),
            }))
    }

    function updateField(stationIndex, fieldIndex, update) {
        // General Field
        if (stationIndex === undefined)
            setSessionInfo(sessionInfo => ({
                ...sessionInfo,
                generalFields: replace(sessionInfo.generalFields, fieldIndex, update),
            }))
        // Station Field
        else
            setSessionInfo(sessionInfo => ({
                ...sessionInfo,
                stations: replace(sessionInfo.stations, stationIndex, {
                    ...sessionInfo.stations[stationIndex],
                    fields: replace(sessionInfo.stations[stationIndex].fields, fieldIndex, update),
                }),
            }))
    }

    function deleteField(stationIndex, fieldIndex) {
        if (stationIndex === undefined)
            setSessionInfo(sessionInfo => ({
                ...sessionInfo,
                generalFields: sessionInfo.generalFields.filter((_, i) => fieldIndex !== i),
            }))
        else
            setSessionInfo(sessionInfo => ({
                ...sessionInfo,
                stations: replace(sessionInfo.stations, stationIndex, {
                    ...sessionInfo.stations[stationIndex],
                    fields: sessionInfo.stations[stationIndex].fields.filter(
                        (_, i) => i !== fieldIndex,
                    ),
                }),
            }))
    }

    async function getSessionInfo(sessionId) {
        try {
            const result = await axios.get(`${serverURL}/api/v1/sessions/${sessionId}`)
            if (result.data) {
                // Need to remove required fields so there are no duplicates
                const nonRequiredSession = removeRequiredFields(result.data)
                setSessionInfo(nonRequiredSession)
            }
        } catch (error) {
            console.error('Could not get session from server', error)
            addSnackBar({
                title: 'Error',
                message: `Could not get session from server: ${error}`,
                variant: 'danger',
                timeout: 2500,
            })
            window.api.writeLog(LOG_LEVEL.ERROR, `Could not get session from server: ${error}`)
        }
    }

    async function getSessionTemplates() {
        try {
            const result = await axios.get(`${serverURL}/api/v1/sessionTemplates`)
            const sessionTemplates = result.data
            return sessionTemplates.map(template => ({
                ...template,
                createdAt: new Date(template.createdAt),
            }))
        } catch (error) {
            console.error('Could not get session template list from server.', error)
            addSnackBar({
                title: 'Error',
                message: `Could not get session template list from server: ${error}`,
                variant: 'danger',
                timeout: 2500,
            })
            window.api.writeLog(
                LOG_LEVEL.ERROR,
                `Could not get session template list from server: ${error}`,
            )
        }
    }

    function openSessionTemplate(template) {
        const { sessionInfo } = template
        const nonRequiredSession = removeRequiredFields(sessionInfo)
        setSessionInfo(nonRequiredSession)
    }

    async function saveSessionTemplate(templateInfo) {
        const template = {
            ...templateInfo,
            sessionInfo,
        }
        try {
            await axios.post(`${serverURL}/api/v1/sessionTemplates`, template)
            addSnackBar({
                title: 'Success',
                message: `Session template successfully saved`,
                variant: 'success',
                timeout: 2500,
            })
        } catch (error) {
            console.error('Could not save session template.', error)
            addSnackBar({
                title: 'Error',
                message: `Could not save session template: ${error}`,
                variant: 'danger',
                timeout: 2500,
            })
            window.api.writeLog(LOG_LEVEL.ERROR, `Could not save session template: ${error}`)
        }
    }

    async function getSessionList() {
        try {
            const result = await axios.get(`${serverURL}/api/v1/sessions`)
            const sessionList = result.data
            return sessionList.map(session => ({
                ...session,
                createdAt: new Date(session.createdAt),
            }))
        } catch (error) {
            console.error('Could not get session list from server.', error)
            addSnackBar({
                title: 'Error',
                message: `Could not get session list from server: ${error}`,
                variant: 'danger',
                timeout: 2500,
            })
            window.api.writeLog(LOG_LEVEL.ERROR, `Could not get session list from server: ${error}`)
        }
    }

    async function startSession(sessionId) {
        const sessionData = {
            sessionId,
            ...sessionInfo,
            stations: sessionInfo.stations.map((station, i) => ({
                ...station,
                fields:
                    i === 0 ? [...ALL_REQUIRED_STATION_FIELDS, ...station.fields] : station.fields,
            })),
        }

        if (socket) {
            socket.emit('session-start', sessionData)
        }
    }

    function stopSession() {
        if (socket) {
            socket.emit('session-stop')
        }
    }

    return (
        <SessionContext.Provider
            value={{
                isConnectedToDB,
                socket,
                sessionIsRunning,
                sessionId,
                sessionInfo,
                sessionLogs,
                connectedUsersByStation,
                getSessionList,
                getSessionTemplates,
                openSessionTemplate,
                saveSessionTemplate,
                startSession,
                stopSession,
                addStation,
                deleteStation,
                addField,
                updateField,
                deleteField,
            }}
        >
            {children}
        </SessionContext.Provider>
    )
}

function removeRequiredFields(session = {}) {
    const { stations = [] } = session

    const cleanedStations = stations.map(station => ({
        ...station,
        fields: (station.fields ?? []).filter(({ key }) => !REQUIRED_DB_FIELDS[key]),
    }))

    return {
        ...session,
        stations: cleanedStations,
    }
}
