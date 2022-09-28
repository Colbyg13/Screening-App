import { ActivityIndicator, Badge, Chip, Flex } from '@react-native-material/core'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native';
import { useSessionContext } from '../contexts/SessionContext';

export default function ServerStatus() {
    const {
        isConnected,
        serverLoading,
        tryFindingServer,
    } = useSessionContext();

    const handleOnPress = () => {
        if (!serverLoading && !isConnected) tryFindingServer();
    }

    return (
        <Chip
            style={{
                backgroundColor: isConnected ? 'lightgreen' : 'lightgray',
                borderWidth: 1,
                borderColor: isConnected ? 'green' : 'gray',
            }}
            onPress={handleOnPress}
        >
            {serverLoading ? <ActivityIndicator /> : null}
            <Text>{isConnected ? 'connected' : 'offline'}</Text>
        </Chip>
    );
}