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
import findServer, { PREVIOUS_CONNECTION_STORAGE_KEY } from "../utils/find-server";
import replace from "../utils/replace";

export const SERVER_PORT = 3333;
export const MAX_TRIES = 5;

const STATION_FIELDS_STORAGE_KEY = 'sessionFields'
const DEVICE_NAME_STORAGE_KEY = 'device-name';


const SessionContext = createContext({
    isConnected: false,
    loading: false,
    serverLoading: false,
    sessionInfo: {},
    sessionRecords: [],
    deviceName: '',
    setDeviceName: () => { },
    uploadOfflineRecords: () => { },
    tryFindingServer: () => { },
    selectedStation: () => { },
    joinStation: () => { },
    leaveStation: () => { },
    getSessionInfo: () => { },
    disconnectFromSession: () => { },
    sendRecord: () => { },
});

export const useSessionContext = () => useContext(SessionContext);

export default function SessionProvider({ children }) {

    const navigation = useNavigation();

    // SERVER
    const [serverIp, setServerIp] = useState();
    const [socket, setSocket] = useState();
    const [isConnected, setIsConnected] = useState(false);
    const [serverLoading, setServerLoading] = useState(false);
    const [snackbarInfo, setSnackbarInfo] = useState();
    const [deviceName, setDeviceName] = useState('');

    useEffect(() => {
        AsyncStorage.getItem(DEVICE_NAME_STORAGE_KEY)
            .then(name => setDeviceName(name || `device-${~~(Math.random() * 1000)}`));
    }, [])


    useEffect(() => {
        if (deviceName) AsyncStorage.setItem(DEVICE_NAME_STORAGE_KEY, deviceName);
        if (socket) setSocket(io(serverIp));
    }, [deviceName]);

    // SESSION
    const [loading, setLoading] = useState(false);
    const [sessionInfo, setSessionInfo] = useState();
    const [sessionRecords, setSessionRecords] = useState([]);
    const [selectedStationId, setSelectedStationId] = useState();

    const patientRecords = useMemo(() => sessionRecords.map(record => new PatientRecord(record, sessionInfo.stations)), [sessionRecords, sessionInfo])
    const selectedStation = useMemo(() => sessionInfo?.stations?.find(({ id }) => id === selectedStationId), [sessionInfo, selectedStationId]);

    // MODAL
    const [modalMessage, setModalMessage] = useState('');

    useEffect(() => {
        if (sessionInfo?.stations) {
            const allStationFields = sessionInfo.stations.reduce((allStationFields, { fields = [] }) => [
                ...allStationFields,
                ...fields,
            ], []);

            AsyncStorage.setItem(STATION_FIELDS_STORAGE_KEY, JSON.stringify(allStationFields));
        }
    }, [sessionInfo]);


    useEffect(() => {
        console.log('Finding Server');
        tryFindingServer();
    }, []);

    // UPLOAD OFFLINE RECORDS TO SERVER WHEN CONNECTED
    useEffect(() => {
        if (isConnected) {
            try {
                getSessionInfo();
                uploadOfflineRecords();
            } catch (error) {
                console.warn(error)
            }
        }
    }, [isConnected])


    useEffect(() => {
        console.log('socket changed');


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
                    const oldRecord = records.find(({ id }) => id === updatedRecord.id);
                    return oldRecord ?
                        replace(records, records.indexOf(oldRecord), updatedRecord)
                        :
                        records;
                });
            });
            socket.on('session-started', () => {
                console.log('session started');
                getSessionInfo();
                setModalMessage('');
            })
            socket.on('session-ended', () => {
                console.log('session ended');
                setModalMessage('The current session has ended.');
                setSessionRecords([]);
            });

            socket.connect();

            socket.on('disconnect', () => {
                console.log('Disconnected from server');
                // socket.off('record-created');
                // socket.off('record-updated');
                // socket.off('session-started');
                // socket.off('session-ended');
                setIsConnected(false);
                setModalMessage('You have disconnected from the server.');
            });

            return () => {
                socket.off('connect');
                socket.off('disconnect');
                socket.off('record-created');
                socket.off('record-updated');
                socket.off('session-started');
                socket.off('session-ended');
            };
        }
    }, [socket]);

    async function tryFindingServer(ipAddress) {
        if (!isConnected) {
            setServerLoading(true);

            try {
                const serverIp = ipAddress ? `http://${ipAddress}:3333` : await findServer(SERVER_PORT, 'api/v1/server')
                if (serverIp) {
                    AsyncStorage.setItem(PREVIOUS_CONNECTION_STORAGE_KEY, ipAddress);
                    console.log(`Server found on: ${serverIp}`);
                    setServerIp(serverIp);
                    setSocket(io(serverIp));
                    setServerLoading(false);
                }
            } catch (error) {
                console.error(error);
                setServerLoading(false);
            }
        }
    }

    async function getSessionInfo(showSnackbar) {
        setLoading(true);
        if (socket) {
            console.log('Connecting to session...');

            try {
                const url = `${serverIp}/api/v1/sessions/current`;
                const { data: { sessionInfo, sessionRecords = [] } = {} } = await axios.get(url, {
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache',
                        'Expires': '0',
                    },
                })
                // console.log({ sessionInfo, rest })
                if (sessionInfo) {
                    setSessionInfo(sessionInfo);
                    setSessionRecords(sessionRecords.map(record => new PatientRecord(record, sessionInfo.stations)));
                } else {
                    if (showSnackbar) setSnackbarInfo({ status: 'error', message: 'Session not started. Check server and try again.' })
                    throw new Error('Session not started. Check server and try again.')
                }
                setLoading(false);

            } catch (error) {
                console.error(error);
                setLoading(false);
                if (showSnackbar) setSnackbarInfo({ status: 'error', message: 'Session not started. Check server and try again' })
                throw new Error('Session not started. Check server and try again');
            }
        } else {
            setLoading(false);

            setSnackbarInfo({ status: 'error', message: 'Could not find server. Try connecting manually by clicking the top right "offline" button' });
            throw new Error('Could not find server.');
        }
    }

    async function joinStation(stationId) {
        console.log('join station');
        setSelectedStationId(stationId);
        socket.emit('connect-to-station', { stationId });
    }

    async function leaveStation() {
        console.log('leave station');
        setSelectedStationId();
        socket.emit('disconnect-from-station');
    }

    async function disconnectFromSession() {
        console.log('Disconnecting from session...');
        socket.emit('disconnect-from-station');
        socket.off('session-info-update');
        setSessionInfo();
        setSessionRecords([]);
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
                .catch(err => console.error(err))
        }
        else if (showModal) setSnackbarInfo({ status: 'success', message: 'offline records have already been synced' })

    }

    async function sendRecord(recordPayload) {
        console.log('Sending record...');
        const createRecord = !recordPayload?.record?.id;
        const createOrUpdate = createRecord ? 'create' : 'update';
        // console.log(createRecord, createOrUpdate)
        const url = `${serverIp}/api/v1/patients/${createOrUpdate}`;
        try {
            const result = await axios.post(url, recordPayload);
            // console.log({ result });
            return result.data;
        } catch (error) {
            console.error(error)
            throw new Error('Unable to send record');
        }
    }

    return (
        <SessionContext.Provider
            value={{
                isConnected,
                serverIp,
                loading,
                sessionInfo,
                sessionRecords: patientRecords,
                selectedStation,
                serverLoading,
                deviceName,
                setDeviceName,
                uploadOfflineRecords,
                tryFindingServer,
                joinStation,
                leaveStation,
                getSessionInfo,
                disconnectFromSession,
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