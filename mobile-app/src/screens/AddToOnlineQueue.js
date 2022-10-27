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
import {   View,
  StyleSheet,
  StatusBar,
  Keyboard,
  Switch,
  ScrollView,
  SafeAreaView, } from 'react-native';
import { useSessionContext } from '../contexts/SessionContext';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const AddToOnlineQueue = ({ route }) => {
  const navigation = useNavigation();
  const { sendRecord, selectedStation: station } = useSessionContext();
  const [formState, setFormState] = useState({}); //used to keep track of inputs.
  const [dateStates, setDateStates] = useState({});
  const [boolStates, setBoolStates] = useState({});
  const [fields, setFields] = useState([]); //used to keep track of inputs and match them to the patient.
  const [visible, setVisible] = useState(false); //opens the dialog/modal.
  const [patient, setPatient] = useState({});
  // const station = route.params.station;
  const numFields = station.fields.length;

  const defaultState = () => {
    let newFields = [];
    for (let i = 0; i < numFields; i++) {
      const varName = station.fields[i].key;
      if (station.fields[i].type === 'date') {
        let showname = `show${varName}`;
        setDateStates((prevState) => ({ ...prevState, [showname]: false }));
      }
      if (station.fields[i].type === 'bool') {
        setFormState((prevState) => ({ ...prevState, [varName]: false }));
      } else {
        setFormState((prevState) => ({ ...prevState, [varName]: '' }));
      }
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
    console.log(formState);
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
    if (field.type === 'date') {
      let showname = `show${field.key}`;
      return (
        <View key={field.name} style={styles.row}>
          <Text style={styles.fieldName}>{field.name}: {formState[field.key]}</Text>
          <Button
            color={'#C7E1FF'}
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
            themeVariant='light' //important do not remove
            onConfirm={(newDate) => {
              setFormState((prevState) => ({
                ...prevState,
                [field.key]: newDate.toLocaleDateString(), //year/month/day
              }));
              setDateStates((prevState) => ({
                ...prevState,
                [showname]: false, //should set dob or whatever date to the date text.
              }));
            }}
            onCancel={() => {
              //should hide the date picker.
              setDateStates((prevState) => ({
                ...prevState,
                [showname]: false, //should set dob or whatever date to the date text.
              }));
            }}
            maximumDate={new Date(2100, 12, 30)}
          ></DateTimePickerModal>
        </View>
      );
    } else if (field.type === 'string') {
      return (
        <View key={field.name} style={styles.row}>
          <Text style={styles.fieldName}>{field.name}:</Text>
          <View>
            <TextInput
              onChangeText={(newText) => {
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
    } else if (field.type === 'bool') {
      return (
        <View key={field.name} style={styles.row}>
          <Text style={styles.fieldName}>{field.name}:</Text>
          <View>
            <Switch
              ios_backgroundColor={'grey'}
              onValueChange={() => {
                const oldState = formState[field.key];
                setFormState((prevState) => ({
                  ...prevState,
                  [field.key]: !oldState,
                }));
              }}
              value={formState[field.key]}
            ></Switch>
          </View>
        </View>
      );
    }
  };
  return (
    // must be wrapped in this to use dialog/modal
    <Provider>
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView}>
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
              if (
                patient.data[field] === true ||
                patient.data[field] === false
              ) {
                return (
                  <Text key={field.key}>
                    {station.fields.find(({ key }) => key === field)?.name}:{' '}
                    {patient.data[field].toString()}
                  </Text>
                );
              } else {
                return (
                  <Text key={field.key}>
                    {station.fields.find(({ key }) => key === field)?.name}:{' '}
                    {patient.data[field]}
                  </Text>
                );
              }
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
      </ScrollView>
      </SafeAreaView>
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
    marginTop: 30,
    margin: 10,
    fontSize: 34,
    alignSelf: 'flex-start',
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
