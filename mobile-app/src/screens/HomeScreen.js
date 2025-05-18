import { Button, Stack } from '@react-native-material/core';
import React from 'react';
import { Dimensions, Image, SafeAreaView, StyleSheet, Text } from 'react-native';
import { useSessionContext } from '../contexts/SessionContext';

const { width, height } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
    const { uploadOfflineRecords, sessionIsRunning, username } = useSessionContext();

    const handleOnPress = async () => {
        navigation.navigate('Station Selection');
    };

    const offlineMode = () => {
        navigation.navigate('Offline Mode');
    };

    const openSettings = () => {
        navigation.navigate('Settings Page');
    };

    const logoHeight = height > 600 ? height * 0.25 : height * 0.15;

    return (
        <SafeAreaView style={styles.container}>
            <Stack center spacing={20} style={styles.stack}>
                <Image
                    source={require('../../assets/healthylogo.png')}
                    style={{ ...styles.logo, height: logoHeight }}
                />
                {username ? (
                    <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Device: {username}</Text>
                ) : null}
                <Button
                    style={styles.button}
                    title="Connect to Session"
                    color={colors.primary}
                    disabled={!sessionIsRunning}
                    titleStyle={styles.buttonText}
                    loadingIndicatorPosition="trailing"
                    onPress={handleOnPress}
                />
                <Button
                    style={styles.button}
                    title="Offline Mode"
                    color={colors.secondary}
                    titleStyle={styles.buttonText}
                    onPress={offlineMode}
                />
                <Button
                    style={styles.button}
                    title="Sync Offline Records"
                    color={colors.secondary}
                    titleStyle={styles.buttonText}
                    onPress={uploadOfflineRecords}
                />
                <Button
                    style={styles.button}
                    title="Settings"
                    color={colors.secondary}
                    titleStyle={styles.buttonText}
                    onPress={openSettings}
                />
                <Text style={styles.versionText}>Version 1.2.1</Text>
            </Stack>
        </SafeAreaView>
    );
}

const colors = {
    primary: '#EDEDED',
    secondary: '#EDEDED',
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
    stack: {
        width: '100%',
    },
    logo: {
        resizeMode: 'contain',
    },
    input: {
        width: '80%',
        marginBottom: 10,
    },
    button: {
        width: '80%',
        paddingVertical: 15,
        marginBottom: 10,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});
