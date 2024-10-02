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
                borderColor: sessionIsRunning ? 'green' : isConnected ? 'blue' : 'gray',
            }}
            onPress={onPress}
        >
            {(!isConnected && findingServers) ? <ActivityIndicator /> : null}
            <Text>{sessionIsRunning ? 'Running' : isConnected ? 'Connected' : 'Offline'}</Text>
        </Chip>
    );
}
