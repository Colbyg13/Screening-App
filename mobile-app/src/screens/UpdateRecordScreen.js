import { TextInput, Pressable } from '@react-native-material/core';
import {
  Provider,
  Button,
  Dialog,
  DialogHeader,
  DialogContent,
  DialogActions,
  Text,
  SafeAreaView,
} from '@react-native-material/core';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { useSessionContext } from '../contexts/SessionContext';

const UpdateRecordScreen = ({ route }) => {
  const navigation = useNavigation();
  const { sendRecord, selectedStation: station } = useSessionContext();
  const [formState, setFormState] = useState({}); //used to keep track of inputs. 
  const [fields, setFields] = useState([]);
  record = route.params.item;
  console.log('selected record', record);
  console.log('selected station', station);

  const defaultState = () => {
    let newFields = [];
    for (let i = 0; i < numFields; i++) {
      const varName = station.fields[i].key;
      setFormState((prevState) => ({ ...prevState, [varName]: '' }));
      newFields.push(varName);
    }
    setFields(newFields);
  };

  useEffect(() => { //sets the state for the form dynamically. I have not implemented validation yet. 
    defaultState();
  }, []);

  useEffect(() => {
    console.log('Fields after default state was called', fields);
  }, [fields]);

  return (
    <View style={styles.container}>
      <Text>UpdateRecord</Text>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    height: '100%',
    marginTop: StatusBar.currentHeight || 0,
    backgroundColor: '#ffffff',
  },
})

export default UpdateRecordScreen;
