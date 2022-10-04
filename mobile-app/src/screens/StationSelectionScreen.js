import React, { useEffect } from 'react';
import StationsList from '../components/StationsList';
import { useSessionContext } from '../contexts/SessionContext';
import { useIsFocused } from '@react-navigation/native';
const StationSelectionScreen = ({ route, navigation }) => {
  // const sessions = route.params.sessionData;
  // console.log("Session Info: ", sessions);

  const isFocused = useIsFocused();
  const { selectedStation, leaveStation } = useSessionContext();

  // leave the station automatically
  useEffect(() => {
    if (isFocused && selectedStation) leaveStation();
  }, [isFocused, selectedStation])

  return (
    <>
      {/* <StationsList data={sessions}>StationSelectionScreen</StationsList> */}
      <StationsList>StationSelectionScreen</StationsList>
    </>
  );
};

export default StationSelectionScreen;
