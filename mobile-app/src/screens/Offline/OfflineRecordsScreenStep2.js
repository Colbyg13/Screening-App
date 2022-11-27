import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from '../../style/styles';
import AddOfflineRecordBtn from '../../components/AddOfflineRecordBtn';
import OfflineRecordItem from '../../components/OfflineRecordItem';

const OfflineRecordsScreenStep2 = ({ route, navigation }) => {
  const [records, setRecords] = useState([]); //array to hold records list
  const customDataTypes = route.params.customDataTypes;
  const selectedDataTypes = route.params.selectedDataTypes;
  const [newRecord, setNewRecord] = useState(null); //object to hold new record
  const [needsToStoreData, setNeedsToStoreData] = useState(false); //boolean to determine if new record needs to be stored
  const [needsUpdate, setNeedsUpdate] = useState(false); //boolean to trigger update of records list
 
  //AsyncStorage.removeItem('LOCAL_RECORDS'); //use this to clear local records
  useEffect(() => {
    retrieveRecords(); //retrieve records from async storage
  }, [needsUpdate]);

  const retrieveRecords = async () => {
    try {
      const value = await AsyncStorage.getItem('LOCAL_RECORDS');
      if (value !== null) {
        // We have data!!
        console.log("DATA FROM STORAGE", value);
        setRecords(JSON.parse(value));
        setNeedsUpdate(false);
      }
    } catch (error) {
      // Error retrieving data
      console.log('no records found');
    }
  };

  const storeRecords = async () => {
    if(records.length > 0) {
      console.log('storing the records')
      try {
        const jsonValue = JSON.stringify(records);
        console.log('SETTING STORAGE TO THIS VALUE', jsonValue);
        await AsyncStorage.setItem('LOCAL_RECORDS', jsonValue);
        setNeedsUpdate(true);
      } catch (e) {
        // saving error
        console.log('error saving record');
      }
    }
    else return //no records to store
  };

  useEffect(() => { //should fire when a new record is submitted
    if (route.params?.newRecord) {
      setRecords((prevState) => [...prevState, route.params.newRecord]);
      setNeedsToStoreData(true);
    }
  }, [route.params?.newRecord]);


  useEffect(() => {
    storeRecords();
  }, [needsToStoreData]);


  const AddRecord = () => {
    navigation.navigate('Offline Add and Update Records', {
      customDataTypes,
      selectedDataTypes,
    });
  };

  const renderOfflineRecordItem = ({ item }) => {
    return <OfflineRecordItem item={item} />;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.pageDirection}>Locally Stored Records</Text>
      <FlatList
        data={records}
        keyExtractor={(item) => item.id}
        renderItem={renderOfflineRecordItem}
        style={styles.flatList}
      />
      <AddOfflineRecordBtn onPress={AddRecord} />
    </SafeAreaView>
  );
};

export default OfflineRecordsScreenStep2;
