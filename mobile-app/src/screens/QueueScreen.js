import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { useEffect } from 'react';
import SessionQueue from '../components/SessionQueue';
const QueueScreen = ({ route, navigation }) => {
  const selectedStation = route.params.selectedStation;
  console.log('STATION 1 ye or nay?: ', selectedStation.isStationOne);
  console.log(selectedStation);
  return (
    <>
      <SessionQueue station={selectedStation} />
    </>
  );
};

export default QueueScreen;
