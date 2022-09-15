import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { useEffect } from 'react';

const QueueScreen = ({ route, navigation }) => {
  const selectedStation = route.params.selectedStation;
  console.log('STATION 1 ye or nay?: ', selectedStation.isStationOne)
  const [isStationOne, setIsStationOne] = useState(selectedStation.isStationOne);
  console.log(selectedStation);
  return (
    <>
      <View><Text>Queue {selectedStation.title}</Text>
      {isStationOne && (
        <Text>I'm Station One ADD TO QUEUE BUTTON</Text>
      )}
      </View>
    </>
  );
};

export default QueueScreen;