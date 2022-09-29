import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native';
import ServerStatus from './src/components/ServerStatus';
import SessionProvider from './src/contexts/SessionContext';
import AddToOnlineQueue from './src/screens/AddToOnlineQueue';
import HomeScreen from './src/screens/HomeScreen';
import QueueScreen from './src/screens/QueueScreen';
import StationSelectionScreen from './src/screens/StationSelectionScreen';
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SessionProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName='Home' screenOptions={{
          headerRight: (props) => <ServerStatus />
        }}>
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
            options={{ title: 'Current Session' }}
          />
          <Stack.Screen
            name='Add To Queue'
            component={AddToOnlineQueue}
            options={{ title: 'Add to Queue' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SessionProvider>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
