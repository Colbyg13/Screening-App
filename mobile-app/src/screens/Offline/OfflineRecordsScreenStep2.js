import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from '../../style/styles';
import AddOfflineRecordBtn from '../../components/AddOfflineRecordBtn';
import OfflineRecordItem from '../../components/OfflineRecordItem';

import {
  Provider,
  Button,
  Dialog,
  DialogHeader,
  DialogContent,
  DialogActions,
} from '@react-native-material/core';

const OfflineRecordsScreenStep2 = ({ route, navigation }) => {
  const [records, setRecords] = useState([]); //array to hold records list
  const customDataTypes = route.params.customDataTypes;
  const selectedDataTypes = route.params.selectedDataTypes;
  const [newRecord, setNewRecord] = useState(null); //object to hold new record
  const [needsToStoreData, setNeedsToStoreData] = useState(false); //boolean to determine if new record needs to be stored
  const [needsUpdate, setNeedsUpdate] = useState(true); //boolean to trigger update of records list

  //AsyncStorage.removeItem('LOCAL_RECORDS'); //use this to clear local records 
  useEffect(() => {
    if (needsUpdate) {
      retrieveRecords(); //retrieve records from async storage
    } else {
      return;
    }
  }, [needsUpdate]);

  useEffect(() => {
    console.log('RECORDS CHANGED', records); //retrieve records from async storage
  }, [records]);

  const retrieveRecords = async () => {
    try {
      const value = await AsyncStorage.getItem('LOCAL_RECORDS');
      if (value !== null) {
        // We have data!!
        console.log('DATA FROM STORAGE', value);
        setRecords(JSON.parse(value));
        setNeedsUpdate(false);
      }
    } catch (error) {
      // Error retrieving data
      console.log('no records found');
    }
  };

  const storeRecords = async () => {
    if (records.length > 0) {
      console.log('storing the records');
      try {
        const sorted = records.sort((a, b) => (a.ID > b.ID ? 1 : -1));
        const jsonValue = JSON.stringify(sorted);
        console.log('SETTING STORAGE TO THIS VALUE', jsonValue);
        await AsyncStorage.setItem('LOCAL_RECORDS', jsonValue);
        setNeedsToStoreData(false);
        setNeedsUpdate(true);
      } catch (e) {
        // saving error
        console.log('error saving record');
      }
    } else return; //no records to store
  };

  useEffect(() => {
    //should fire when a new record is submitted
    console.log('firing new record. ');
    if (route.params?.newRecord) {
      //check if ID is already in records
      const newRecord = route.params.newRecord;
      const newRecordID = newRecord.ID;
      const found = records.find((record) => record.ID === newRecordID);
      if (found) {
        console.log('found a record with the same ID'); //replace or ignore? for now, ignore
        //if found, replace the record
        return;
      } else {
        //if not found, add the record
        console.log(
          'firing new record. with newRecord ',
          records,
          route.params.newRecord
        );
        setRecords((prevState) => [...prevState, route.params.newRecord]);
        setNeedsToStoreData(true);
        route.params.newRecord = null;
      }
    }
  }, [route.params?.newRecord]);

  useEffect(() => {
    //should fire when a new record is submitted

    if (route.params?.updatedRecord) {
      const updatedRecord = route.params.updatedRecord;
      const oldRecordID = route.params.oldRecordID;
      if (updatedRecord.ID != oldRecordID) {
        console.log('overwriting ID');
        for (let i = 0; i < records.length; i++) {
          if (records[i].ID === oldRecordID) {
            //find the record with the old ID
            let update = [...records];
            update[i] = updatedRecord; //replace the record with the updated record and new ID
            setRecords(update);
            setNeedsToStoreData(true);
          }
        }
      } else {
        //updating record, leave ID the same
        for (let i = 0; i < records.length; i++) {
          if (records[i].ID === updatedRecord.ID) {
            let update = [...records];
            update[i] = updatedRecord;
            setRecords(update);
            setNeedsToStoreData(true);
          }
        }
      }
    }
  }, [route.params?.updatedRecord]);

  useEffect(() => {
    if (needsToStoreData) {
      storeRecords();
    } else {
      return;
    }
  }, [needsToStoreData]);

  const AddRecord = () => {
    navigation.navigate('Offline Add Records', {
      customDataTypes,
      selectedDataTypes,
    });
  };

  const handlePress = (item) => {
    navigation.navigate('Offline Update Records', {
      item,
      customDataTypes,
      selectedDataTypes,
    });
  };

  const renderOfflineRecordItem = ({ item }) => {
    return (
      <OfflineRecordItem
        item={item}
        key={item.ID}
        onPress={() => handlePress(item)}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.pageDirection}>Locally Stored Records</Text>
      <FlatList
        data={records}
        keyExtractor={(item) => item.ID}
        renderItem={renderOfflineRecordItem}
        style={styles.flatList}
      />
      <AddOfflineRecordBtn onPress={AddRecord} />
    </SafeAreaView>
  );
};

export default OfflineRecordsScreenStep2;
