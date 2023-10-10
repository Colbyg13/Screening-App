import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, Button, Dialog, DialogActions, DialogContent, DialogHeader, Text } from "@react-native-material/core";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { io } from "socket.io-client";
import PatientRecord from "../classes/patient-record";
import Snackbar from "../components/Snackbar";
import { LOCAL_RECORDS_STORAGE_KEY } from "../screens/Offline/OfflineRecordsScreenStep2";
import replace from "../utils/replace";
import { useServerContext } from './ServerContext';
import { useCustomDataTypesContext } from './CustomDataContext';

export const SERVER_PORT = 3333;

const STATION_FIELDS_STORAGE_KEY = 'sessionFields'
const DEVICE_NAME_STORAGE_KEY = 'device-name';


const SessionContext = createContext({
    isConnected: false,
    sessionIsRunning: false,
    loading: false,
    sessionInfo: {},
    sessionRecords: [],
    deviceName: '',
    selectedStation: {},
    setDeviceName: () => { },
    uploadOfflineRecords: () => { },
    joinStation: () => { },
    leaveStation: () => { },
    sendRecord: () => { },
});

export const useSessionContext = () => useContext(SessionContext);

export default function SessionProvider({ children }) {


    const { serverIp } = useServerContext();
    const { customDataTypeMap } = useCustomDataTypesContext();

    const navigation = useNavigation();

    const [isConnected, setIsConnected] = useState(false);
    const [socket, setSocket] = useState(null);
    const [deviceName, setDeviceName] = useState('');

    // SESSION
    const [loading, setLoading] = useState(false);
    const [sessionInfo, setSessionInfo] = useState({});
    const [sessionIsRunning, setSessionIsRunning] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [sessionRecords, setSessionRecords] = useState([]);
    const [selectedStationId, setSelectedStationId] = useState();

    // snackbar
    const [snackbarInfo, setSnackbarInfo] = useState();

    // MODAL
    const [modalMessage, setModalMessage] = useState('');

    // DATA
    const patientRecords = useMemo(() => sessionRecords.map(record => new PatientRecord(record, sessionInfo.stations)), [sessionRecords, sessionInfo]);
    const selectedStation = useMemo(() => sessionInfo?.stations?.find(({ id }) => id === selectedStationId), [sessionInfo, selectedStationId]);

    useEffect(() => {
        // get device name
        AsyncStorage.getItem(DEVICE_NAME_STORAGE_KEY)
            .then(name => setDeviceName(name || `device-${~~(Math.random() * 1000)}`));
    }, []);

    // updates device name in local storage and in socket
    useEffect(() => {
        if (deviceName) AsyncStorage.setItem(DEVICE_NAME_STORAGE_KEY, deviceName);
        if (socket) {
            socket.auth = { username: deviceName };
        }
    }, [deviceName, socket]);

    // UPLOAD OFFLINE RECORDS TO SERVER WHEN CONNECTED
    useEffect(() => {
        if (isConnected) {
            try {
                uploadOfflineRecords();
            } catch (error) {
                console.warn(error)
            }
        }
    }, [isConnected])

    useEffect(() => {
        if (serverIp) {
            updateFieldsFromServer();
        }
    }, [serverIp]);


    // get session data
    useEffect(() => {
        if (sessionId) {
            getSessionInfo(sessionId);
            getSessionRecords(sessionId)
        }
    }, [sessionId]);

    useEffect(() => {
        const socket = io(serverIp);
        setSocket(socket);

        if (socket) {
            socket.auth = { username: deviceName };
            socket.on('connect', () => {
                console.log('Connected to server');
                setIsConnected(true);
            });

            socket.on('record-created', createdRecord => {
                setSessionRecords(records => [...records, createdRecord]);
            });

            socket.on('record-updated', updatedRecord => {
                setSessionRecords(records => {
                    const oldRecord = records.find(({ id }) => id === updatedRecord?.id);
                    return oldRecord ?
                        replace(records, records.indexOf(oldRecord), updatedRecord)
                        :
                        records;
                });
            });

            socket.on('session-info', data => {
                console.log('session info');
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
                setModalMessage('You have disconnected from the server.');
            });

            return () => {
                socket.disconnect();
            };
        }
    }, [serverIp]);

    async function getSessionInfo(sessionId) {
        setLoading(true);
        try {
            const result = await axios.get(`${serverIp}/api/v1/sessions/${sessionId}`);
            if (result.data) {
                setSessionInfo(result.data);
            }
        } catch (error) {
            setSnackbarInfo({
                status: 'error',
                message: `Could not get session from server: ${error}`,
            });
        } finally {
            setLoading(false);
        }
    }

    async function getSessionRecords(sessionId) {
        try {
            const result = await axios.get(`${serverIp}/api/v1/records`, { params: { sessionId, unitConversions: customDataTypeMap } });
            if (result.data) {
                setSessionRecords(result.data);
            }
        } catch (error) {
            setSnackbarInfo({
                status: 'error',
                message: `Could not get session records from server: ${error}`,
            });
        }
    }

    async function updateFieldsFromServer() {
        try {
            const result = await axios.get(`${serverIp}/api/v1/fields`);
            if (result.data) {
                AsyncStorage.setItem(STATION_FIELDS_STORAGE_KEY, JSON.stringify(result.data));
            }
        } catch (error) {
            console.warn(error)
        }
    }


    async function joinStation(stationId) {
        console.log('join station');
        setSelectedStationId(stationId);
        socket.emit('station-join', { stationId });
    }

    async function leaveStation() {
        console.log('leave station');
        setSelectedStationId();
        socket.emit('station-leave');
    }

    async function uploadOfflineRecords(showModal) {
        const offlineRecords = JSON.parse(await AsyncStorage.getItem(LOCAL_RECORDS_STORAGE_KEY));
        if (offlineRecords && offlineRecords.length) {
            Promise.allSettled(offlineRecords.map(({ customData, ...record }) => sendRecord({ record, customData })))
                .then(results => {
                    const notUpdatedRecords = offlineRecords.filter((_, i) => results[i].status !== 'fulfilled');
                    // delete all updated records in local storage
                    if (notUpdatedRecords.length) {
                        AsyncStorage.setItem(LOCAL_RECORDS_STORAGE_KEY, JSON.stringify(notUpdatedRecords));
                        setSnackbarInfo({ status: 'error', message: 'Could not sync all offline records' })
                    }
                    else {
                        AsyncStorage.removeItem(LOCAL_RECORDS_STORAGE_KEY);
                        setSnackbarInfo({ status: 'success', message: 'Offline records successfully synced' })
                    }
                })
                .catch(err => console.warn(err))
        }
        else if (showModal) setSnackbarInfo({ status: 'success', message: 'offline records have already been synced' })

    }

    async function sendRecord(recordPayload) {
        console.log('Sending record...');
        const payload = {
            ...recordPayload,
            record: {
                ...recordPayload.record,
                sessionId,
            },
        }

        try {
            const result = await axios.post(`${serverIp}/api/v1/records`, payload);
            return result.data;
        } catch (error) {
            console.warn(error)
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
                deviceName,
                setDeviceName,
                uploadOfflineRecords,
                joinStation,
                leaveStation,
                sendRecord,
            }}
        >
            <Snackbar
                open={!!snackbarInfo}
                onClose={() => setSnackbarInfo()}
                message={snackbarInfo?.message}
                severity={snackbarInfo?.status}
                duration={6000}
            />
            <Dialog
                visible={!!modalMessage}
                onDismiss={() => { }}
            >
                <DialogHeader title={modalMessage} />
                <DialogContent>
                    <View style={{ display: 'flex', flexDirection: 'row' }}>
                        <Text>Waiting to reconnect</Text>
                        <ActivityIndicator style={{ marginStart: 6 }} />
                    </View>
                </DialogContent>
                <DialogActions>
                    <Button
                        title='Go Home'
                        compact
                        variant='text'
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