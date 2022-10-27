import React from 'react';
import { View, SafeAreaView } from 'react-native';
import { Stack, Button } from '@react-native-material/core';
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
      <Stack fill center spacing={20}>
        <Button
          style={{ width: 250 }}
          title='Connect to Session'
          color='#EDEDED'
          titleStyle={{ fontSize: 18, fontWeight: 'bold' }}
          loading={loading}
          loadingIndicatorPosition='trailing'
          onPress={handleOnPress}
        ></Button>
        <Button
          style={{ width: 250 }}
          title='Offline Mode'
          color='#EDEDED'
          titleStyle={{ fontSize: 18, fontWeight: 'bold' }}
          onPress={offlineMode}
        ></Button>
        <Button
          style={{ width: 250 }}
          title='Sync Offline Records'
          color='#EDEDED'
          titleStyle={{ fontSize: 18, fontWeight: 'bold' }}
        ></Button>
      </Stack>
    </SafeAreaView>
  );
};

export default HomeScreen;
