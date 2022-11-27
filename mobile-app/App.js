import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native';
import SessionProvider, {
  useSessionContext,
} from './src/contexts/SessionContext';
import HomeScreen from './src/screens/HomeScreen';
import StationSelectionScreen from './src/screens/StationSelectionScreen';
import QueueScreen from './src/screens/QueueScreen';
import AddToOnlineQueue from './src/screens/AddToOnlineQueue';
import ServerStatus from './src/components/ServerStatus';
import UpdateRecordScreen from './src/screens/UpdateRecordScreen';
import CustomDataTypesProvider from './src/contexts/CustomDataContext';
import { Provider } from '@react-native-material/core';
import IpadOfflineModeStep1 from './src/screens/Offline/IpadOfflineModeStep1';
import OfflineRecordsScreenStep2 from './src/screens/Offline/OfflineRecordsScreenStep2';
import OfflineAddRecordStep3 from './src/screens/Offline/OfflineAddRecordStep3';
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <Provider>
      <NavigationContainer>
        <SessionProvider>
          <CustomDataTypesProvider>
            <Stack.Navigator
              initialRouteName='Home'
              screenOptions={{
                headerRight: ServerStatus,
              }}
            >
              <Stack.Screen
                name='Home'
                component={HomeScreen}
                options={{ title: 'Home Screen' }}
              />
              <Stack.Screen
                name='Station Selection'
                component={StationSelectionScreen}
                options={{ title: 'Stations' }}
              />
              <Stack.Screen
                name='Current Session Queue'
                component={QueueScreen}
                options={{ title: 'Session' }}
              />
              <Stack.Screen
                name='Add To Queue'
                component={AddToOnlineQueue}
                options={{ title: 'Add to Queue' }}
              />
              <Stack.Screen
                name='Update Record'
                component={UpdateRecordScreen}
                options={{ title: 'Update Record' }}
              />
              <Stack.Screen
                name='Offline Mode'
                component={IpadOfflineModeStep1}
                options={{ title: 'Offline Mode' }}
              />
              <Stack.Screen
                name='Offline Records'
                component={OfflineRecordsScreenStep2}
                options={{ title: 'Offline Records' }}
              />
              <Stack.Screen
                name='Offline Add and Update Records'
                component={OfflineAddRecordStep3}
                options={{ title: 'Add Offline Record' }}
              />
            </Stack.Navigator>
          </CustomDataTypesProvider>
        </SessionProvider>
      </NavigationContainer>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
