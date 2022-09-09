import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { Stack, Button } from '@react-native-material/core';
const HomeScreen = ({ navigation }) => {
  console.log('navigation', navigation);
  const [loading, setLoading] = useState(false);
  const handleOnPress = () => {
    setLoading(!loading);
  }
  return (
    <View
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
          loadingIndicatorPosition="trailing"
          onPress={handleOnPress}
        ></Button>
        <Button
          style={{ width: 250 }}
          title='Offline Mode'
          color='#EDEDED'
          titleStyle={{ fontSize: 18, fontWeight: 'bold' }}
        ></Button>
        <Button
          style={{ width: 250 }}
          title='Sync Offline Records'
          color='#EDEDED'
          titleStyle={{ fontSize: 18, fontWeight: 'bold' }}
        ></Button>
      </Stack>
    </View>
  );
};

export default HomeScreen;
