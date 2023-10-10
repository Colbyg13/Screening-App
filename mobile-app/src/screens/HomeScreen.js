import { Button, Stack, TextInput } from '@react-native-material/core';
import React from 'react';
import { Image, SafeAreaView } from 'react-native';
import { useSessionContext } from '../contexts/SessionContext';

export const DEVICE_NAME_STORAGE_KEY = 'device-name';
//This is the homescreen. It has offline buttons and an the ability to connect to a session once you are connected to a server. 
const HomeScreen = ({ navigation }) => {
  const { uploadOfflineRecords, deviceName, setDeviceName, sessionIsRunning } = useSessionContext();

  const handleOnPress = async () => {
    navigation.navigate('Station Selection');
  };

  const offlineMode = () => {
    navigation.navigate('Offline Mode');
  };
  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
      }}
    >
      <Stack center spacing={20}>
        <Image
          source={require('../../assets/healthylogo.png')}
          style={{
            height: '25%',
            resizeMode: 'contain',
          }}
        />
        <TextInput
          style={{ width: 350 }}
          label="Device Name"
          value={deviceName}
          placeholder="John Doe's iPad"
          onChangeText={setDeviceName}
        />
        <Button
          style={{ width: 350, padding: 20, margin: 20 }}
          title='Connect to Session'
          color='#EDEDED'
          disabled={!sessionIsRunning}
          titleStyle={{ fontSize: 22, fontWeight: 'bold' }}
          loadingIndicatorPosition='trailing'
          onPress={handleOnPress}
        ></Button>
        <Button
          style={{ width: 350, padding: 20, margin: 20 }}
          title='Offline Mode'
          color='#EDEDED'
          titleStyle={{ fontSize: 22, fontWeight: 'bold' }}
          onPress={offlineMode}
        ></Button>
        <Button
          style={{ width: 350, padding: 20, margin: 20 }}
          title='Sync Offline Records'
          color='#EDEDED'
          titleStyle={{ fontSize: 22, fontWeight: 'bold' }}
          onPress={uploadOfflineRecords}
        ></Button>
      </Stack>
    </SafeAreaView>
  );
};

export default HomeScreen;
