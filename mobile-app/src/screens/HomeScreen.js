import { Button, Stack } from '@react-native-material/core';
import React from 'react';
import { Image, SafeAreaView } from 'react-native';
import { useSessionContext } from '../contexts/SessionContext';

const HomeScreen = ({ navigation }) => {
  const { getSessionInfo, loading } = useSessionContext();
  const handleOnPress = async () => {
    try {
      await getSessionInfo();

      navigation.navigate('Station Selection');
    } catch (e) {
      console.error(e);
    }
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
        <Button
          style={{ width: 350, padding: 20, margin: 20 }}
          title='Connect to Session'
          color='#EDEDED'
          titleStyle={{ fontSize: 22, fontWeight: 'bold' }}
          loading={loading}
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
        ></Button>
      </Stack>
    </SafeAreaView>
  );
};

export default HomeScreen;
