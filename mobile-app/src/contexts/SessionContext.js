import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    ActivityIndicator,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogHeader,
    Text,
} from '@react-native-material/core';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { io } from 'socket.io-client';
import PatientRecord from '../classes/patient-record';
import { SNACKBAR_SEVERITIES } from '../components/Snackbar';
import { ROUTES } from '../constants/navigation';
import { LOCAL_RECORDS_STORAGE_KEY } from '../screens/Offline/OfflineRecordsScreenStep2';
import { useCustomDataTypesContext } from './CustomDataContext';
import { useServerContext } from './ServerContext';
import { useSnackbarContext } from './SnackbarContext';

export const STATION_FIELDS_STORAGE_KEY = 'sessionFields';

const REDIRECT_ON_SESSION_END_ROUTES = [
    ROUTES.STATION_SELECTION,
    ROUTES.UPDATE_RECORD,
    ROUTES.ADD_TO_QUEUE,
    ROUTES.CURRENT_SESSION_QUEUE,
];

const SessionContext = createContext({
    isConnected: false,
    sessionIsRunning: false,
    loading: false,
    sessionInfo: {},
    sessionRecords: [],
    selectedStation: {},
    uploadOfflineRecords: () => {},
    joinStation: () => {},
    leaveStation: () => {},
    sendRecord: () => {},
});

export const useSessionContext = () => useContext(SessionContext);

export default function SessionProvider({ children }) {
    const { serverURL } = useServerContext();
    const { customDataTypeMap } = useCustomDataTypesContext();

    const navigation = useNavigation();

    const [isConnected, setIsConnected] = useState(false);
    const [socket, setSocket] = useState(null);

    // SESSION
    const [loading, setLoading] = useState(false);
    const [sessionInfo, setSessionInfo] = useState({});
    const [sessionIsRunning, setSessionIsRunning] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [sessionRecords, setSessionRecords] = useState([]);
    const [selectedStationId, setSelectedStationId] = useState();

    // snackbar
    const { addSnackbar } = useSnackbarContext();

    // MODAL
    const [modalMessage, setModalMessage] = useState('');

    // DATA
    const patientRecords = useMemo(
        () => sessionRecords.map(record => new PatientRecord(record, sessionInfo.stations)),
        [sessionRecords, sessionInfo],
    );
    const selectedStation = useMemo(
        () => sessionInfo?.stations?.find(({ id }) => id === selectedStationId),
        [sessionInfo, selectedStationId],
    );

    // UPLOAD OFFLINE RECORDS TO SERVER WHEN CONNECTED
    useEffect(() => {
        if (isConnected) {
            try {
                uploadOfflineRecords();
            } catch (error) {
                console.warn(error);
            }
        }
    }, [isConnected]);

    useEffect(() => {
        if (serverURL) {
            updateFieldsFromServer();
        }
    }, [serverURL]);

    // get session data
    useEffect(() => {
        if (sessionId) {
            getSessionInfo(sessionId);
            getSessionRecords(sessionId);
        }
    }, [sessionId]);

    useEffect(() => {
        const socket = io(serverURL);
        setSocket(socket);

        if (socket) {
            socket.on('connect', () => {
                console.log('Connected to server');
                setIsConnected(true);
            });

            socket.on('record-created', createdRecord => {
                setSessionRecords(records => [...records, createdRecord]);
            });

            socket.on('record-updated', updatedRecord => {
                setSessionRecords(records => {
                    const oldRecordIndex = records.findIndex(({ id }) => id === updatedRecord?.id);
                    return oldRecordIndex >= 0
                        ? records.with(oldRecordIndex, updatedRecord)
                        : records;
                });
            });

            socket.on('session-info', data => {
                const {
                    initial,
                    sessionIsRunning: newSessionIsRunning,
                    sessionId: newSessionId,
                } = data;

                setSessionIsRunning(newSessionIsRunning);
                setSessionId(newSessionId);

                if (newSessionIsRunning) {
                    setModalMessage('');
                    // already was running
                } else if (!initial) {
                    setModalMessage('The current session has ended.');
                    setSessionRecords([]);
                }
            });

            socket.on('disconnect', () => {
                console.log('Disconnected from server');
                setIsConnected(false);
                setSessionIsRunning(false);
                setSessionId();

                const state = navigation.getState();
                const currentPageName = state.routes.at(-1)?.name;
                if (REDIRECT_ON_SESSION_END_ROUTES.includes(currentPageName)) {
                    setModalMessage('You have disconnected from the server.');
                }
            });

            return () => {
                socket.disconnect();
                setSocket(null);
            };
        }
    }, [serverURL]);

    async function getSessionInfo(sessionId) {
        setLoading(true);
        try {
            const result = await axios.get(`${serverURL}/api/v1/sessions/${sessionId}`);
            if (result.data) {
                setSessionInfo(result.data);
            }
        } catch (error) {
            addSnackbar({
                message: `Could not get session from server: ${error}`,
                severity: SNACKBAR_SEVERITIES.ERROR,
            });
        } finally {
            setLoading(false);
        }
    }

    async function getSessionRecords(sessionId) {
        try {
            const result = await axios.get(`${serverURL}/api/v1/records`, {
                params: { sessionId, unitConversions: customDataTypeMap },
            });
            if (result.data) {
                setSessionRecords(result.data);
            }
        } catch (error) {
            addSnackbar({
                message: `Could not get session records from server: ${error}`,
                severity: SNACKBAR_SEVERITIES.ERROR,
            });
        }
    }

    async function updateFieldsFromServer() {
        try {
            const result = await axios.get(`${serverURL}/api/v1/fields`);
            if (result.data) {
                const existingFieldsJSON = await AsyncStorage.getItem(STATION_FIELDS_STORAGE_KEY);
                const existingFields = existingFieldsJSON ? JSON.parse(existingFieldsJSON) : [];

                // remove duplicate keys
                const allFieldsMap = [...existingFields, ...result.data].reduce(
                    (allFieldsMap, field) => {
                        allFieldsMap[field.key] = field;
                        return allFieldsMap;
                    },
                    {},
                );

                const allFields = Object.values(allFieldsMap).sort((a, b) =>
                    a.key < b.key ? -1 : 1,
                );

                AsyncStorage.setItem(STATION_FIELDS_STORAGE_KEY, JSON.stringify(allFields));
            }
        } catch (error) {
            console.warn(error);
        }
    }

    async function joinStation(stationId) {
        if (!socket) return;
        console.log('join station');
        setSelectedStationId(stationId);
        socket.emit('station-join', { stationId });
    }

    async function leaveStation() {
        if (!socket) return;
        console.log('leave station');
        setSelectedStationId();
        socket.emit('station-leave');
    }

    async function uploadOfflineRecords(showModal) {
        if (!isConnected) {
            addSnackbar({
                message: 'Cannot sync records when not connected to a server',
                severity: SNACKBAR_SEVERITIES.ERROR,
            });
            return;
        }

        const offlineRecords = JSON.parse(await AsyncStorage.getItem(LOCAL_RECORDS_STORAGE_KEY));
        if (offlineRecords && offlineRecords.length) {
            Promise.allSettled(
                offlineRecords.map(({ customData, ...record }) =>
                    sendRecord({ record, customData }),
                ),
            )
                .then(results => {
                    const notUpdatedRecords = offlineRecords.filter(
                        (_, i) => results[i].status !== 'fulfilled',
                    );
                    // delete all updated records in local storage
                    if (notUpdatedRecords.length) {
                        AsyncStorage.setItem(
                            LOCAL_RECORDS_STORAGE_KEY,
                            JSON.stringify(notUpdatedRecords),
                        );

                        addSnackbar({
                            severity: SNACKBAR_SEVERITIES.ERROR,
                            message: 'Could not sync all offline records',
                        });
                    } else {
                        AsyncStorage.removeItem(LOCAL_RECORDS_STORAGE_KEY);
                        addSnackbar({
                            severity: SNACKBAR_SEVERITIES.SUCCESS,
                            message: 'Offline records successfully synced',
                        });
                    }
                })
                .catch(err => console.warn(err));
        } else if (showModal)
            addSnackbar({
                severity: SNACKBAR_SEVERITIES.SUCCESS,
                message: 'offline records have already been synced',
            });
    }

    async function sendRecord(recordPayload) {
        console.log('Sending record...');
        const payload = {
            ...recordPayload,
            record: {
                ...recordPayload.record,
                sessionId,
            },
        };

        try {
            const result = await axios.post(`${serverURL}/api/v1/records`, payload);
            return result.data;
        } catch (error) {
            console.warn(error);
            throw new Error('Error sending record to server.');
        }
    }

    return (
        <SessionContext.Provider
            value={{
                isConnected,
                sessionIsRunning,
                loading,
                sessionInfo,
                sessionRecords: patientRecords,
                selectedStation,
                uploadOfflineRecords,
                joinStation,
                leaveStation,
                sendRecord,
            }}
        >
            <Dialog visible={!!modalMessage} onDismiss={() => {}}>
                <DialogHeader title={modalMessage} />
                <DialogContent>
                    <View style={{ display: 'flex', flexDirection: 'row' }}>
                        <Text>Waiting to reconnect</Text>
                        <ActivityIndicator style={{ marginStart: 6 }} />
                    </View>
                </DialogContent>
                <DialogActions>
                    <Button
                        title="Go Home"
                        compact
                        variant="text"
                        onPress={() => {
                            setModalMessage('');
                            while (navigation.canGoBack()) {
                                navigation.goBack();
                            }
                        }}
                    />
                </DialogActions>
            </Dialog>
            {children}
        </SessionContext.Provider>
    );
}
