import { MaterialIcons } from '@expo/vector-icons';
import {
    ActivityIndicator,
    Button,
    Dialog,
    DialogContent,
    DialogHeader,
    TextInput,
} from '@react-native-material/core';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useServerContext } from '../contexts/ServerContext';
import { useSnackbarContext } from '../contexts/SnackbarContext';
import { SNACKBAR_SEVERITIES } from './Snackbar';
import { validateIP } from '../utils/network';

//Shows if you are connected or not. Long press allows you to type in IP address.
export default function ServerConnectModal({ showModal = false, onDismiss = () => {} }) {
    const {
        findServer,
        availableServerIps,
        serverIp,
        connectToServer,
        disconnectFromServer,
        findingServers,
    } = useServerContext();

    const { addSnackbar } = useSnackbarContext();

    const [manualIPAddress, setManualIPAddress] = useState('');

    function handleManualServerConnect() {
        if (!validateIP(manualIPAddress)) {
            addSnackbar({
                message: 'Invalid IP Address. Should look something like `192.168.0.200`',
                severity: SNACKBAR_SEVERITIES.WARNING,
            });
            return;
        }
        connectToServer(manualIPAddress);
    }

    // resets state when modal leaves
    useEffect(() => {
        if (!showModal) {
            setManualIPAddress('');
        }
    }, [showModal]);

    return (
        <Dialog visible={showModal} onDismiss={onDismiss}>
            <DialogHeader
                title={
                    <View style={styles.titleContainer}>
                        <Text style={styles.titleText}>Find Server</Text>
                    </View>
                }
            />
            <DialogContent>
                <View style={styles.contentContainer}>
                    <View style={styles.currentConnectionRow}>
                        <View style={styles.currentConnectionTextWrapper}>
                            <Text style={styles.currentConnectionText}>Connected IP:</Text>
                            <Text style={styles.currentConnectionIP}>{serverIp ?? 'None'}</Text>
                        </View>
                        {serverIp ? (
                            <TouchableOpacity
                                style={styles.currentConnectionDisconnectButton}
                                onPress={disconnectFromServer}
                            >
                                <Text style={styles.currentConnectionDisconnectButtonText}>
                                    Disconnect
                                </Text>
                            </TouchableOpacity>
                        ) : null}
                    </View>
                    <View style={styles.serverFinderContainer}>
                        <View style={styles.serverFinderTitleContainer}>
                            <Text style={styles.serverFinderTitleText}>Servers on Network</Text>
                            <TouchableOpacity onPress={findServer}>
                                <MaterialIcons name="refresh" size={24} />
                            </TouchableOpacity>
                        </View>
                        {availableServerIps.map(ipAddress => (
                            <TouchableOpacity
                                style={styles.foundServerContainer}
                                key={ipAddress}
                                onPress={() => connectToServer(ipAddress)}
                            >
                                <View
                                    style={[
                                        styles.foundServerChip,
                                        {
                                            backgroundColor:
                                                serverIp === ipAddress ? 'green' : 'gray',
                                        },
                                    ]}
                                />
                                <Text style={styles.foundServerText}>ip: {ipAddress}</Text>
                            </TouchableOpacity>
                        ))}
                        {findingServers ? (
                            <ActivityIndicator />
                        ) : !availableServerIps.length ? (
                            <Text style={styles.noServerFoundText}>No Servers Found</Text>
                        ) : null}
                    </View>
                    <View style={styles.manualConnectContainer}>
                        <Text style={styles.manualConnectTitle}>Manual Connection</Text>
                        <View>
                            <TextInput
                                keyboardType="number-pad"
                                placeholder="192.186.1.100"
                                value={manualIPAddress}
                                onChangeText={setManualIPAddress}
                            />
                            <Button
                                variant="outlined"
                                color="secondary"
                                title="Connect"
                                onPress={handleManualServerConnect}
                            />
                        </View>
                    </View>
                </View>
            </DialogContent>
        </Dialog>
    );
}

const styles = StyleSheet.create({
    titleContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        borderBottomWidth: 1,
    },
    titleText: {
        fontSize: 32,
    },
    currentConnectionRow: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 8,
    },
    currentConnectionTextWrapper: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    currentConnectionText: {
        fontSize: 18,
        marginRight: 4,
    },
    currentConnectionIP: {
        fontSize: 16,
    },
    currentConnectionDisconnectButton: {
        borderWidth: 1,
        backgroundColor: 'red',
        borderRadius: 4,
        width: '100%',
        paddingVertical: 4,
        alignItems: 'center',
    },
    currentConnectionDisconnectButtonText: {
        fontSize: 16,
        color: 'white',
    },
    serverFinderContainer: {
        minHeight: 200,
        paddingHorizontal: 4,
        paddingTop: 4,
        paddingBottom: 8,
        borderWidth: 1,
        borderColor: 'gray',
        marginBottom: 16,
    },
    serverFinderTitleContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        borderBottomWidth: 0.25,
        marginBottom: 4,
    },
    serverFinderTitleText: {
        fontSize: 18,
    },
    foundServerContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 0.25,
        borderColor: 'gray',
        marginHorizontal: 4,
        marginTop: 6,
        paddingHorizontal: 8,
        paddingVertical: 6,
        shadowRadius: 4,
        backgroundColor: 'light-gray',
    },
    foundServerText: {
        fontSize: 16,
        marginRight: 4,
    },
    foundServerChip: {
        borderRadius: 50,
        width: 8,
        height: 8,
        marginRight: 6,
    },
    noServerFoundText: {
        fontSize: 14,
        textAlign: 'center',
        color: 'gray',
        marginTop: 8,
        marginBottom: 4,
    },
    manualConnectTitle: {
        fontSize: 20,
        borderBottomWidth: 0.25,
        marginBottom: 8,
    },
});
