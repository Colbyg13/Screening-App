import {
    ActivityIndicator,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogHeader,
    TextInput,
} from '@react-native-material/core';
import React, { useState } from 'react';
import { Text } from 'react-native';
import { useSessionContext } from '../contexts/SessionContext';
import { useServerContext } from '../contexts/ServerContext';

//Shows if you are connected or not. Long press allows you to type in IP address.
export default function ServerStatus() {
    const { serverLoading, tryFindingServer } = useServerContext();

    const { isConnected, sessionIsRunning } = useSessionContext();

    const [showModal, setShowModal] = useState(false);
    const [ipAddress, setIpAddress] = useState('');

    const handleLongPress = () => {
        if (!serverLoading) tryFindingServer();
    };

    const handleOnPress = () => {
        setShowModal(true);
    };

    return (
        <>
            <Dialog visible={showModal} onDismiss={() => setShowModal(false)}>
                <DialogHeader title="Connect to Ip Address" />
                <DialogContent>
                    <TextInput
                        keyboardType="number-pad"
                        placeholder="192.186.1.45"
                        onChangeText={setIpAddress}
                        style={{
                            height: 40,
                            padding: 10,
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="outlined"
                        title="Connect"
                        onPress={() => {
                            tryFindingServer(ipAddress);
                            setShowModal(false);
                        }}
                    />
                </DialogActions>
            </Dialog>
            <Chip
                style={{
                    backgroundColor: sessionIsRunning
                        ? 'lightgreen'
                        : isConnected
                          ? 'lightblue'
                          : 'lightgray',
                    borderWidth: 1,
                    borderColor: sessionIsRunning ? 'green' : isConnected ? 'blue' : 'gray',
                }}
                onPress={handleOnPress}
                onLongPress={handleLongPress}
            >
                {serverLoading ? <ActivityIndicator /> : null}
                <Text>{sessionIsRunning ? 'started' : isConnected ? 'connected' : 'offline'}</Text>
            </Chip>
        </>
    );
}
