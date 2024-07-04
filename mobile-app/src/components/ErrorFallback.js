import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function ErrorFallback({ error, resetError }) {
    const navigation = useNavigation();

    function handleRefresh() {
        resetError();

        while (navigation.canGoBack()) {
            navigation.goBack();
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.errorText}>Something went wrong!</Text>
            <Text style={styles.errorMessage}>{error?.message}</Text>
            <Button title="Refresh" onPress={handleRefresh} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    errorText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    errorMessage: {
        fontSize: 16,
        marginBottom: 16,
        textAlign: 'center',
    },
});
