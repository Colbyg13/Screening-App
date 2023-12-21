import { Provider } from '@react-native-material/core'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import ServerStatus from './src/components/ServerStatus'
import CustomDataTypesProvider from './src/contexts/CustomDataContext'
import SessionProvider from './src/contexts/SessionContext'
import AddToOnlineQueue from './src/screens/AddToOnlineQueue'
import HomeScreen from './src/screens/HomeScreen'
import IpadOfflineModeStep1 from './src/screens/Offline/IpadOfflineModeStep1'
import OfflineAddRecordStep3 from './src/screens/Offline/OfflineAddRecordStep3'
import OfflineRecordsScreenStep2 from './src/screens/Offline/OfflineRecordsScreenStep2'
import OfflineUpdateRecordStep3 from './src/screens/Offline/OfflineUpdateRecordStep3'
import QueueScreen from './src/screens/QueueScreen'
import StationSelectionScreen from './src/screens/StationSelectionScreen'
import UpdateRecordScreen from './src/screens/UpdateRecordScreen'
import ServerProvider from './src/contexts/ServerContext'
const Stack = createNativeStackNavigator()

export default function App() {
    return (
        <Provider>
            <NavigationContainer>
                <ServerProvider>
                    <CustomDataTypesProvider>
                        <SessionProvider>
                            <Stack.Navigator
                                initialRouteName="Home"
                                screenOptions={{
                                    headerRight: ServerStatus,
                                }}
                            >
                                <Stack.Screen
                                    name="Home"
                                    component={HomeScreen}
                                    options={{ title: 'Home Screen' }}
                                />
                                <Stack.Screen
                                    name="Station Selection"
                                    component={StationSelectionScreen}
                                    options={{ title: 'Stations' }}
                                />
                                <Stack.Screen
                                    name="Current Session Queue"
                                    component={QueueScreen}
                                    options={{ title: 'Session' }}
                                />
                                <Stack.Screen
                                    name="Add To Queue"
                                    component={AddToOnlineQueue}
                                    options={{ title: 'Add to Queue' }}
                                />
                                <Stack.Screen
                                    name="Update Record"
                                    component={UpdateRecordScreen}
                                    options={{ title: 'Update Record' }}
                                />
                                <Stack.Screen
                                    name="Offline Mode"
                                    component={IpadOfflineModeStep1}
                                    options={{ title: 'Offline Mode' }}
                                />
                                <Stack.Screen
                                    name="Offline Records"
                                    component={OfflineRecordsScreenStep2}
                                    options={{ title: 'Offline Records' }}
                                />
                                <Stack.Screen
                                    name="Offline Add Records"
                                    component={OfflineAddRecordStep3}
                                    options={{ title: 'Add Offline Record' }}
                                />
                                <Stack.Screen
                                    name="Offline Update Records"
                                    component={OfflineUpdateRecordStep3}
                                    options={{ title: 'Update Offline Record' }}
                                />
                            </Stack.Navigator>
                        </SessionProvider>
                    </CustomDataTypesProvider>
                </ServerProvider>
            </NavigationContainer>
        </Provider>
    )
}
