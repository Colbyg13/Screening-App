import React, { useEffect } from 'react';
import StationsList from '../components/StationsList';
import { useSessionContext } from '../contexts/SessionContext';
import { useIsFocused } from '@react-navigation/native';
import { useCustomDataTypesContext } from '../contexts/CustomDataContext';
const StationSelectionScreen = ({ route, navigation }) => {
  const { customDataTypes } = useCustomDataTypesContext();
  // console.log('Custom Data Types: ', customDataTypes);
  const isFocused = useIsFocused();
  const { selectedStation, leaveStation, sessionInfo } = useSessionContext();
  // console.log('Session Info: ', sessionInfo);
  // leave the station automatically
  useEffect(() => {
    if (isFocused && selectedStation) leaveStation();
  }, [isFocused, selectedStation]);

  return (
    <>
      <StationsList>StationSelectionScreen</StationsList>
    </>
  );
};

export default StationSelectionScreen;
