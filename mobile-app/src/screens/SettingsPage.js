import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ERROR_LOGS_STORAGE_KEY } from '../components/ErrorBoundary';
import { Button } from '@react-native-material/core';

const SettingsScreen = () => {
    const [errorLogs, setErrorLogs] = useState([]);
    const [expandedLog, setExpandedLog] = useState(null);
    const [isResetModalVisible, setResetModalVisible] = useState(false);

    useEffect(() => {
        fetchErrorLogs();
    }, []);

    const fetchErrorLogs = async () => {
        try {
            const errorLogsJSON = await AsyncStorage.getItem(ERROR_LOGS_STORAGE_KEY);
            const logs = errorLogsJSON ? JSON.parse(errorLogsJSON) : [];
            setErrorLogs(logs);
        } catch (error) {
            console.error('Error reading error logs:', error);
        }
    };

    const resetData = async () => {
        try {
            await AsyncStorage.clear();
            setErrorLogs([]);
            setExpandedLog(null);
            setResetModalVisible(false); // Close the modal after reset
            Alert.alert('Data Reset', 'All data has been reset.');
            // restart device or if connected to the server, do something to reconnect to get new data.
        } catch (error) {
            console.error('Error resetting data:', error);
        }
    };

    const toggleLogExpansion = (index) => {
        setExpandedLog(expandedLog === index ? null : index);
    };

    return (
        <View style={styles.container}>
            <View style={styles.titleContainer}>
                <Text style={styles.title}>ERROR LOGS</Text>
            </View>
            <ScrollView style={styles.scrollContainer}>
                {errorLogs.length ? errorLogs.map((log, index) => (
                    <TouchableOpacity key={index} onPress={() => toggleLogExpansion(index)}>
                        <View style={styles.logItemContainer}>
                            <Text style={styles.logItemTimestamp}>{log.timestamp}</Text>
                            {expandedLog === index ? (
                                <Text style={styles.logItemDetails}>
                                    {log.error} - {log.stackTrace}
                                </Text>
                            ) : (
                                <Text style={styles.logItemMessage}>
                                    {truncateErrorMessage(log.error)}
                                </Text>
                            )}
                        </View>
                    </TouchableOpacity>
                )) : (
                    <Text>
                        NO LOGS
                    </Text>
                )}
            </ScrollView>
            <Button
                title="Delete All Data"
                onPress={() => setResetModalVisible(true)}
                color="#FF4444"
                style={styles.button}
                titleStyle={styles.buttonText}
            />

            {/* Reset Modal */}
            <Modal
                transparent={true}
                animationType="slide"
                visible={isResetModalVisible}
                onRequestClose={() => setResetModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Confirm Data Reset</Text>
                        <Text style={styles.modalText}>Are you sure you want to delete all data?</Text>
                        <View style={styles.modalButtonsWrapper}>
                            <Button
                                style={{ marginRight: 8 }}
                                title="Cancel"
                                onPress={() => setResetModalVisible(false)}
                                color="#bbb"
                            />
                            <Button
                                title="Reset Data"
                                onPress={resetData}
                                color="#FF4444"
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};


const truncateErrorMessage = (errorMessage) => {
    const maxLength = 50;
    return errorMessage.length > maxLength
        ? `${errorMessage.substring(0, maxLength)}... (Tap to see more)`
        : errorMessage;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#ffffff',
    },
    titleContainer: {
        alignItems: 'center',
        marginBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    scrollContainer: {
        flex: 1,
        marginBottom: 10,
        borderWidth: 1,
    },
    logItemContainer: {
        flexDirection: 'column',
        padding: 10,
        borderBottomWidth: 1,
    },
    logItemTimestamp: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    logItemMessage: {
        fontSize: 14,
        color: '#333333',
    },
    logItemDetails: {
        fontSize: 14,
        color: '#333333',
        marginTop: 5,
    },
    button: {
        paddingVertical: 8,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalText: {
        fontSize: 16,
        marginBottom: 20,
    },
    modalButtonsWrapper: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between'
    }
});

export default SettingsScreen;
