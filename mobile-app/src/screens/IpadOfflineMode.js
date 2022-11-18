import React from 'react';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView, Text, View, ScrollView, FlatList } from 'react-native';
import { styles } from '../style/styles';
import { Switch } from '@react-native-material/core';
import OfflineSessionDataItem from '../components/OfflineSessionDataItem';

const IpadOfflineMode = ({ route, navigation }) => {
  const [customDataTypes, setCustomDataTypes] = useState([]); //list of custom types from async storage
  const [customDataReady, setCustomDataReady] = useState(false);
  const [standardDataTypes, setStandardDataTypes] = useState([]); //list of standard types from async storage
  const [standardDataReady, setStandardDataReady] = useState(false);
  const [allTypes, setAllTypes] = useState([]); //combined list of standard and custom types
  const [selectedDataTypes, setSelectedDataTypes] = useState([]); //list of selected types based on switch
  const CUSTOM_DATA_STORAGE_KEY = 'customData';
  const STATION_FIELDS_STORAGE_KEY = 'sessionFields';
  useEffect(() => {
    // initially get custom data from async storage
    AsyncStorage.getItem(CUSTOM_DATA_STORAGE_KEY)
      // if there are custom Data types, then we don't want to override it because it came from the DB already
      .then((storedCustomDataString) =>
        setCustomDataTypes(
          (customDataTypes) => JSON.parse(storedCustomDataString) || []
        )
      );
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

  console.log('customDataTypes', customDataTypes);
  console.log('standardDataTypes', standardDataTypes);

  const renderDataTypes = (item) => {
    const data = item.item;
    let isCustom = checkIsCustom(data)
    if(isCustom){
      let customData = customDataTypes.find((dataType) => dataType.type === data.name)
      console.log('found the custom info', customData)
      return (
        <OfflineSessionDataItem
          key={data._id}
          item={data}
          handleSelection={handleSelection}
          type="custom"
          customData={customData}
        />
      );
    }
    else {
      return (
        <OfflineSessionDataItem
          key={data.key}
          item={data}
          handleSelection={handleSelection}
          type="standard"
        />
      );
    }
  };

  const handleSelection = (data, value) => {
    //navigation.navigate('Offline Records', { data });
    console.log('selection for: ', data, 'updated: ', value);
    if (value) {
      setSelectedDataTypes((prevState) => [...prevState, data]);
    } else {
      setSelectedDataTypes((prevState) =>
        prevState.filter((item) => item._id !== data._id)
      );
    }
  };

  const checkIsCustom = (field) => {
    console.log('checking custom', field.type)
    if (field.type === 'string' || field.type === 'number' || field.type === 'bool' || field.type === 'number' || field.type === 'date') {
      return false
    }
    else {
      return true
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <Text style={styles.pageDirection}>What data are you collecting?</Text>
        <FlatList
          data={standardDataTypes}
          keyExtractor={(item) => item._id}
          renderItem={renderDataTypes}
          style={styles.flatList}
        />
      </View>
    </SafeAreaView>
  );
};

export default IpadOfflineMode;

//set up async storage for fields
