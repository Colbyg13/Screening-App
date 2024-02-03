import React, { useEffect } from 'react';
import StationsList from '../components/StationsList';
import { useSessionContext } from '../contexts/SessionContext';
import { useIsFocused } from '@react-navigation/native';
import { useCustomDataTypesContext } from '../contexts/CustomDataContext';

//the screen for selecting a station to collect data for.
const StationSelectionScreen = ({ route, navigation }) => {
    const isFocused = useIsFocused();
    const { selectedStation, leaveStation } = useSessionContext();

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
