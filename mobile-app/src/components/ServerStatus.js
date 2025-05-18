import { ActivityIndicator, Chip } from '@react-native-material/core';
import React from 'react';
import { Text } from 'react-native';
import { useServerContext } from '../contexts/ServerContext';
import { useSessionContext } from '../contexts/SessionContext';

//Shows if you are connected or not. Long press allows you to type in IP address.
export default function ServerStatus({ onPress = () => {} }) {
    const { findingServers } = useServerContext();
    const { isConnected, sessionIsRunning } = useSessionContext();

    return (
        <Chip
            style={{
                backgroundColor: sessionIsRunning
                    ? 'lightgreen'
                    : isConnected
                    ? 'lightblue'
                    : 'lightgray',
                borderWidth: 1,
                width: 100,
                borderColor: sessionIsRunning ? 'green' : isConnected ? 'blue' : 'gray',
            }}
            onPressOut={onPress}
        >
            {(!isConnected && findingServers) ? <ActivityIndicator /> : null}
            <Text style={{ textAlign: 'center', width: '100%' }}>{sessionIsRunning ? 'Running' : isConnected ? 'Connected' : 'Offline'}</Text>
        </Chip>
    );
}
