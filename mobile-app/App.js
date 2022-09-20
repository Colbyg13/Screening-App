import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native';
import SessionProvider, { useSessionContext } from './src/contexts/SessionContext';
import HomeScreen from './src/screens/HomeScreen';
import StationSelectionScreen from './src/screens/StationSelectionScreen';
import QueueScreen from './src/screens/QueueScreen';
import AddToOnlineQueue from './src/screens/AddToOnlineQueue';
import { Text } from '@react-native-material/core';
const Stack = createNativeStackNavigator();

function InnerApp() {
  const { isConnected } = useSessionContext()

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Home' screenOptions={{
        headerRight: (props) => <Text>{isConnected ? 'Connected' : 'Offline'}</Text>
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
  );
}

export default function App() {
  return (
    <SessionProvider>
      <InnerApp />
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
