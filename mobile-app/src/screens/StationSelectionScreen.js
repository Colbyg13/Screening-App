import React from 'react';
import { Text, View } from 'react-native';
import StationsList from '../components/StationsList';
const StationSelectionScreen = ({ route, navigation }) => {
  // const sessions = route.params.sessionData;
  // console.log("Session Info: ", sessions);
  return (
    <>
      {/* <StationsList data={sessions}>StationSelectionScreen</StationsList> */}
      <StationsList>StationSelectionScreen</StationsList>
    </>
  );
};

export default StationSelectionScreen;
