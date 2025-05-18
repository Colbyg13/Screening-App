import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useState } from 'react';
import ServerConnectModal from './src/components/ServerConnectModal';
import ServerStatus from './src/components/ServerStatus';
import AddToOnlineQueue from './src/screens/AddToOnlineQueue';
import HomeScreen from './src/screens/HomeScreen';
import IpadOfflineModeStep1 from './src/screens/Offline/IpadOfflineModeStep1';
import OfflineAddRecordStep3 from './src/screens/Offline/OfflineAddRecordStep3';
import OfflineRecordsScreenStep2 from './src/screens/Offline/OfflineRecordsScreenStep2';
import OfflineUpdateRecordStep3 from './src/screens/Offline/OfflineUpdateRecordStep3';
import QueueScreen from './src/screens/QueueScreen';
import SettingsPage from './src/screens/SettingsPage';
import StationSelectionScreen from './src/screens/StationSelectionScreen';
import UpdateRecordScreen from './src/screens/UpdateRecordScreen';
import { ROUTES } from './src/constants/navigation';
import { SafeAreaView, Platform } from 'react-native';
const Stack = createNativeStackNavigator();

export default function NavigationWrapper() {
    const [showServerModal, setShowServerModal] = useState(false);

    function handleServerStatusPress() {
        setShowServerModal(true);
    }

    function onServerModalDismiss() {
        setShowServerModal(false);
    }

    return (
        <>
                <ServerConnectModal showModal={showServerModal} onDismiss={onServerModalDismiss} />
                <Stack.Navigator
                    initialRouteName={ROUTES.HOME}
                    screenOptions={{
                        headerRight: () => <ServerStatus onPress={handleServerStatusPress} />,
                    }}
                >
                    <Stack.Screen
                        name={ROUTES.HOME}
                        component={HomeScreen}
                        options={{ title: 'Home Screen' }}
                    />
                    <Stack.Screen
                        name={ROUTES.STATION_SELECTION}
                        component={StationSelectionScreen}
                        options={{ title: 'Stations' }}
                    />
                    <Stack.Screen
                        name={ROUTES.CURRENT_SESSION_QUEUE}
                        component={QueueScreen}
                        options={{ title: 'Session' }}
                    />
                    <Stack.Screen
                        name={ROUTES.ADD_TO_QUEUE}
                        component={AddToOnlineQueue}
                        options={{ title: 'Add to Queue' }}
                    />
                    <Stack.Screen
                        name={ROUTES.UPDATE_RECORD}
                        component={UpdateRecordScreen}
                        options={{ title: 'Update Record' }}
                    />
                    <Stack.Screen
                        name={ROUTES.OFFLINE_MODE}
                        component={IpadOfflineModeStep1}
                        options={{ title: 'Offline Mode' }}
                    />
                    <Stack.Screen
                        name={ROUTES.OFFLINE_RECORDS}
                        component={OfflineRecordsScreenStep2}
                        options={{ title: 'Offline Records' }}
                    />
                    <Stack.Screen
                        name={ROUTES.OFFLINE_ADD_RECORDS}
                        component={OfflineAddRecordStep3}
                        options={{ title: 'Add Offline Record' }}
                    />
                    <Stack.Screen
                        name={ROUTES.OFFLINE_UPDATE_RECORDS}
                        component={OfflineUpdateRecordStep3}
                        options={{ title: 'Update Offline Record' }}
                    />
                    <Stack.Screen
                        name={ROUTES.SETTINGS_PAGE}
                        component={SettingsPage}
                        options={{ title: 'Settings' }}
                    />
                </Stack.Navigator>
        </>
    );
}
