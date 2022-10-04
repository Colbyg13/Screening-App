import { TextInput, Pressable } from '@react-native-material/core';
import {
  Provider,
  Button,
  Dialog,
  DialogHeader,
  DialogContent,
  DialogActions,
  Text,
} from '@react-native-material/core';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { useSessionContext } from '../contexts/SessionContext';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const AddToOnlineQueue = ({ route }) => {
  const navigation = useNavigation();
  const { sendRecord, selectedStation: station } = useSessionContext();
  const [formState, setFormState] = useState({}); //used to keep track of inputs.
  const [fields, setFields] = useState([]); //used to keep track of inputs and match them to the patient.
  const [visible, setVisible] = useState(false); //opens the dialog/modal.
  const [patient, setPatient] = useState({});
  // const station = route.params.station;
  const numFields = station.fields.length;

  const defaultState = () => {
    let newFields = [];
    for (let i = 0; i < numFields; i++) {
      const varName = station.fields[i].key;
      //if type == date, save varName and `showVarName`: false,
      setFormState((prevState) => ({ ...prevState, [varName]: '' }));
      newFields.push(varName);
    }
    setFields(newFields);
  };

  useEffect(() => {
    //sets the state for the form dynamically. I have not implemented validation yet.
    defaultState();
  }, []);

  useEffect(() => {
    console.log('Fields after default state was called', fields);
  }, [fields]);

  useEffect(() => {
    //sets the default patient to have a null id, and the correct fields for the station.
    setPatient((prevState) => ({ ...prevState, data: formState, id: null }));
  }, [formState]);

  const handleSubmit = async () => {
    console.log('You pressed submit');
    console.log('Current State: ', formState);
    //Some validation function
    //call function to handle SOCKET EVENT TO ADD NEW RECORD TO SESSION/QUEUE
    //On success open dialog with new ID, name, and DOB
    //On dialog close go back to session and update list of patients
    const newId = await sendRecord(formState);
    // let newId = Math.floor(Math.random() * 10); //this id will be given in the server
    setPatient((prevState) => ({ ...prevState, id: newId })); //on server success set the patient in state for display.

    setVisible(true); //opens the modal/dialog
  };

  const renderInput = (field) => {
    console.log('input type', field.type);

    if (field.type === 'date') {
      let showVar = `show${field.key}`
      console.log(showVar);
      return (
        <View key={field.name} style={styles.row}>
          <Text style={styles.fieldName}>{field.name}:</Text>
          <Button title='show date picker'></Button>
          <DateTimePickerModal
            onConfirm={(newDate) => {
              console.log(newDate);
              setFormState((prevState) => ({
                ...prevState,
                [field.key]: newDate, //should set dob or whatever date to the date text. 
              }));
            }}
            onCancel={() => { //should hide the date picker. 
              setFormState((prevState) => ({
                ...prevState,
                [showVar]: false,
              }))
            }}
          ></DateTimePickerModal>
        </View>
      );
    }
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
  };
  return (
    // must be wrapped in this to use dialog/modal
    <Provider>
      <View style={styles.container}>
        <Text style={{ fontSize: 24, textAlign: 'center', marginTop: 30 }}>
          AddToOnlineQueue
        </Text>
        <Text style={styles.pageDirection}>Patient Information</Text>
        <View>
          {station.fields.map((field) => {
            return renderInput(field);
          })}
        </View>

        <View style={styles.wrapper}>
          <Pressable
            style={styles.btnSubmit}
            pressEffect='ripple'
            pressEffectColor='#4c5e75'
            onPress={handleSubmit}
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
        <Dialog visible={visible} onDismiss={() => setVisible(false)}>
          <DialogHeader title='Added to Queue Successully!' />
          <DialogContent>
            <Text>New ID: {patient.id}</Text>
            {fields.map((field) => {
              return (
                <Text>
                  {station.fields.find(({ key }) => key === field)?.name}:{' '}
                  {patient.data[field]}
                </Text>
              );
            })}
          </DialogContent>
          <DialogActions>
            <Button
              title='Ok'
              compact
              variant='text'
              onPress={() => {
                setVisible(false);
                navigation.navigate('Current Session Queue');
              }}
            />
          </DialogActions>
        </Dialog>
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
  pageDirection: {
    margin: 10,
    fontSize: 34,
    alignSelf: 'start',
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
export default AddToOnlineQueue;
