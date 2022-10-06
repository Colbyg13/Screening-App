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
import { View, StyleSheet, StatusBar, Keyboard } from 'react-native';
import { useSessionContext } from '../contexts/SessionContext';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const UpdateRecordScreen = ({ route }) => {
  const navigation = useNavigation();
  const { sendRecord, selectedStation: station } = useSessionContext();
  const [formState, setFormState] = useState({}); //used to keep track of inputs.
  const [dateStates, setDateStates] = useState({})
  const [fields, setFields] = useState([]);
  record = route.params.item;
  const numFields = station.fields.length;
  console.log('selected record', record);
  console.log('selected station', station);

  const defaultState = () => {
    let newFields = [];
    for (let i = 0; i < numFields; i++) {
      const varName = station.fields[i].key;
      if (station.fields[i].type === 'date') {
        let showname = `show${varName}`;
        setDateStates((prevState) => ({ ...prevState, [showname]: false }));
      }
      setFormState((prevState) => ({ ...prevState, [varName]: '' }));
      newFields.push(varName);
    }
    setFields(newFields);
  };

  useEffect(() => {
    //sets the state for the form dynamically. I have not implemented validation yet.
    defaultState();
    setFormState((prevState) => ({ ...prevState, _id: record._id })); //sets object id
  }, []);

  useEffect(() => {
    console.log('FORM STATE UPDATED', formState);
  }, [formState]);

  useEffect(() => {
    console.log('Fields after default state was called', fields);
  }, [fields]);

  const handleSubmit = async () => {
    console.log('You pressed submit');
    console.log('Current State: ', formState);
    //Some validation function
    //call function to handle SOCKET EVENT TO ADD NEW RECORD TO SESSION/QUEUE
    //On success open dialog with new ID, name, and DOB
    //On dialog close go back to session and update list of patients
    const result = await sendRecord(formState);
    console.log(result);
  };
  const renderInput = (field) => {
    console.log('input type', field.type);

    if (field.type === 'date') {
      let showname = `show${field.key}`;
      console.log(showname);
      return (
        <View key={field.name} style={styles.row}>
          <Text style={styles.fieldName}>{field.name}:</Text>
          <Button
            title={`Select ${field.name}`}
            onPress={() => {
              setDateStates((prevState) => ({
                ...prevState,
                [showname]: true,
              }));
            }}
          ></Button>
          <DateTimePickerModal
            isVisible={dateStates[showname]}
            mode='date'
            display='spinner'
            themeVariant='light'
            onConfirm={(newDate) => {
              console.log('heyo', newDate);
              setFormState((prevState) => ({
                ...prevState,
                [field.key]: newDate.toLocaleDateString(), //year/month/day
              }));
              setDateStates((prevState) => ({
                ...prevState,
                [showname]: false, //should set dob or whatever date to the date text.
              }))
            }}
            onCancel={() => {
              //should hide the date picker.
              setDateStates((prevState) => ({
                ...prevState,
                [showname]: false, //should set dob or whatever date to the date text.
              }))
            }}
            maximumDate={new Date(2100, 12, 30)}
          ></DateTimePickerModal>
        </View>
      );
    } else if (field.type === 'text') {
      return (
        <View key={field.name} style={styles.row}>
          <Text style={styles.fieldName}>{field.name}:</Text>
          <View>
            <TextInput
              onChangeText={(newText) => {
                console.log(newText);
                setFormState((prevState) => ({
                  ...prevState,
                  [field.key]: newText,
                }));
              }}
              style={styles.fieldInput}
              required={field.required}
            ></TextInput>
          </View>
        </View>
      );
    } else if (field.type === 'number') {
      return (
        <View key={field.name} style={styles.row}>
          <Text style={styles.fieldName}>{field.name}:</Text>
          <View>
            <TextInput
              keyboardType='number-pad'
              returnKeyType='done'
              onSubmitEditing={Keyboard.dismiss}
              onChangeText={(newText) => {
                console.log(newText);
                setFormState((prevState) => ({
                  ...prevState,
                  [field.key]: newText,
                }));
              }}
              style={styles.fieldInput}
              required={field.required}
            ></TextInput>
          </View>
        </View>
      );
    }
  };

  return (
    <Provider>
      <View style={styles.container}>
        <Text style={styles.pageDirection}>Patient Information</Text>
        <View style={styles.patientInfoWrapper}>
          <Text style={styles.patientInfoItem}>ID: {record.id}</Text>
          <Text style={styles.patientInfoItem}>Name: {record.name}</Text>
          <Text style={styles.patientInfoItem}>DOB: {record.dob}</Text>
        </View>

        <View>
          <Text style={styles.pageDirection}>{station.name} Data:</Text>
        </View>
        <View>
          {station.fields.map((field) => {
            return renderInput(field);
          })}
        </View>
        <View style={styles.wrapper}>
          <Pressable
            onPress={handleSubmit}
            style={styles.btnSubmit}
            pressEffect='ripple'
            pressEffectColor='#4c5e75'
          >
            <Text style={styles.btnText}>Submit</Text>
          </Pressable>
          <Pressable
            style={styles.btnCancel}
            pressEffect='ripple'
            pressEffectColor='#FCB8B8'
          >
            <Text style={styles.btnText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Provider>
  );
};
const styles = StyleSheet.create({
  container: {
    height: '100%',
    marginTop: StatusBar.currentHeight || 0,
    backgroundColor: '#ffffff',
  },
  fieldName: {
    alignSelf: 'flex-start',
    marginBottom: 5,
    fontSize: 22,
  },
  fieldInput: {
    width: 200,
    padding: 5,
    fontSize: 30,
  },
  row: {
    marginLeft: 20,
    marginTop: 20,
    flexDirection: 'column',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  pageDirection: {
    margin: 16,
    marginTop: 20,
    fontSize: 34,
    alignSelf: 'start',
  },
  patientInfoWrapper: {
    backgroundColor: '#EDEDED',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 10,
    overflow: 'hidden',
  },
  patientInfoItem: {
    fontSize: 24,
    margin: 5,
  },
  wrapper: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  btnSubmit: {
    alignSelf: 'flex-end',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#A3CDFF',
    height: 50,
    width: 100,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 20,
  },
  btnCancel: {
    alignSelf: 'flex-end',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#FF6464',
    height: 50,
    width: 100,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 20,
  },
  btnText: {
    fontSize: 22,
  },
});

export default UpdateRecordScreen;
