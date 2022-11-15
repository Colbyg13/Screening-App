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
import IpadOfflineMode from './src/screens/IpadOfflineMode';
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SessionProvider>
      <CustomDataTypesProvider>
        <NavigationContainer>
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
              component={IpadOfflineMode}
              options={{ title: 'Offline Mode' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </CustomDataTypesProvider>
    </SessionProvider>
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
