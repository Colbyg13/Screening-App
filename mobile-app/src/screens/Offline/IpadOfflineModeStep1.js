import React from 'react';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView, Text, View, ScrollView, FlatList } from 'react-native';
import { styles } from '../../style/styles';
import OfflineStationDataTypeItem from '../../components/OfflineStationDataTypeItem';
import NextButton from '../../components/NextButton';
import {
  Provider,
  Button,
  Dialog,
  DialogHeader,
  DialogContent,
  DialogActions,
} from '@react-native-material/core';

const IpadOfflineModeStep1 = ({ route, navigation }) => {
  const [customDataTypes, setCustomDataTypes] = useState([]); //list of custom types from async storage
  const [customDataReady, setCustomDataReady] = useState(false);
  const [standardDataTypes, setStandardDataTypes] = useState([]); //list of standard types from async storage
  const [standardDataReady, setStandardDataReady] = useState(false);
  const [allTypes, setAllTypes] = useState([]); //combined list of standard and custom types
  const [selectedDataTypes, setSelectedDataTypes] = useState([]); //list of selected types based on switch
  const [isVisible, setIsVisible] = useState(false); //disable next button until at least one type is selected
  const CUSTOM_DATA_STORAGE_KEY = 'customData';
  const STATION_FIELDS_STORAGE_KEY = 'sessionFields';
  const SELECTED_DATA_TYPES_STORAGE_KEY = 'selectedDataTypes';
  useEffect(() => {
    // initially get custom data from async storage
    AsyncStorage.getItem(CUSTOM_DATA_STORAGE_KEY)
      // if there are custom Data types, then we don't want to override it because it came from the DB already
      .then(storedCustomDataString => setCustomDataTypes(customDataTypes => customDataTypes.length ?
        customDataTypes
        :
        JSON.parse(storedCustomDataString) || []
    ))
    setCustomDataReady(true);
  }, []);

  useEffect(() => {
    // initially get standard data from async storage
    AsyncStorage.getItem(STATION_FIELDS_STORAGE_KEY)
      // if there are standard Data types, then we don't want to override it because it came from the DB already
      .then((storedStandardDataString) =>
        setStandardDataTypes(
          (standardTypes) => JSON.parse(storedStandardDataString) || []
        )
      );
    setStandardDataReady(true);
  }, []);

  useEffect(() => {
    //initially get saved selected data types from async storage
    AsyncStorage.removeItem(SELECTED_DATA_TYPES_STORAGE_KEY);
  }, []);

  // console.log('customDataTypes', customDataTypes);
  // console.log('standardDataTypes', standardDataTypes);
  useEffect(() => {
    console.log('selected type changed: ', selectedDataTypes);
  }, [selectedDataTypes]);

  const renderDataTypes = (item) => {
    const data = item.item;
    let isCustom = checkIsCustom(data);
    if (isCustom) {
      let customData = customDataTypes.find(
        (dataType) => dataType.type === data.name
      );
      //  console.log('found the custom info', customData)
      return (
        <OfflineStationDataTypeItem
          key={data._id}
          item={data}
          handleSelection={handleSelection}
          type='custom'
          customData={customData}
        />
      );
    } else {
      return (
        <OfflineStationDataTypeItem
          key={data.key}
          item={data}
          handleSelection={handleSelection}
          type='standard'
        />
      );
    }
  };

  const handleSelection = (data, value) => {
    if (value) {
      //if the switch is on, add the data type to the list
      setSelectedDataTypes((prevState) => [...prevState, data]);
    } else {
      //if the switch is off, remove the data type from the list
      setSelectedDataTypes((prevState) =>
        prevState.filter((item) => item.name !== data.name)
      );
    }
  };

  const checkIsCustom = (field) => {
    if (
      field.type === 'string' ||
      field.type === 'number' ||
      field.type === 'bool' ||
      field.type === 'number' ||
      field.type === 'date'
    ) {
      return false;
    } else {
      return true;
    }
  };

  const handleNextPress = () => {
    if (selectedDataTypes.length >= 1) {
      navigation.navigate('Offline Records', {
        selectedDataTypes,
        customDataTypes,
      });
    } else {
      setIsVisible((prevState) => !prevState);
    }
  };

  const handleDismiss = () => {
    setIsVisible((prevState) => !prevState);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <Text style={styles.pageDirection}>What data are you collecting?</Text>
        <FlatList
          data={standardDataTypes}
          keyExtractor={(item) => item.name}
          renderItem={renderDataTypes}
          style={styles.flatList}
        />
        <Dialog visible={isVisible} onDismiss={() => setIsVisible(false)}>
          <DialogHeader title='No Selection Made' />
          <DialogContent>
            <Text style={{ fontSize: 20 }}>
              Please select at least one data type to continue to the next step.
            </Text>
          </DialogContent>
          <DialogActions>
            <Button
              title='Cancel'
              compact
              color='#FF6464'
              onPress={() => setIsVisible(false)}
            />
            <Button
              title='Ok'
              compact
              color='#A3CDFF'
              style={{ marginLeft: 10, marginRight: 10 }}
              onPress={() => setIsVisible(false)}
            />
          </DialogActions>
        </Dialog>
        <NextButton onPress={handleNextPress} />
      </View>
    </SafeAreaView>
  );
};

export default IpadOfflineModeStep1;

//set up async storage for fields
