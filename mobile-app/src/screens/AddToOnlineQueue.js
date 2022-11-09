import { Pressable, TextInput } from '@react-native-material/core';
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
import { View, Keyboard, ScrollView, SafeAreaView } from 'react-native';
import { useSessionContext } from '../contexts/SessionContext';
import CustomDataPicker from '../components/Inputs/CustomDataPicker';
import { styles } from '../style/styles';
import DatePicker from '../components/Inputs/DatePicker';
import BoolInput from '../components/Inputs/BoolInput';

const AddToOnlineQueue = ({ route }) => {
  const navigation = useNavigation();
  const { sendRecord, selectedStation: station } = useSessionContext();
  const [formState, setFormState] = useState({}); //used to keep track of inputs.
  const [dateStates, setDateStates] = useState({});
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
        setFormState((prevState) => ({ ...prevState, [varName]: undefined }));
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
    //sets the default patient to have a null id, and the correct fields for the station.
    setPatient((prevState) => ({ ...prevState, data: formState, id: null }));
    console.log(formState);
  }, [formState]);

  const handleSubmit = async () => {
    //Some validation function
    //call function to handle SOCKET EVENT TO ADD NEW RECORD TO SESSION/QUEUE
    //On success open dialog with new ID, name, and DOB
    //On dialog close go back to session and update list of patients
    const newId = await sendRecord(formState);
    // let newId = Math.floor(Math.random() * 10); //this id will be given in the server
    setPatient((prevState) => ({ ...prevState, id: newId })); //on server success set the patient in state for display.

    setVisible(true); //opens the modal/dialog
  };

  const handleFormUpdate = (field, selectedItem) => {
    //console.log('handling update', field, selectedItem);
    setFormState((prevState) => ({
      ...prevState,
      [field.key]: selectedItem,
    }));
  };

  const handleDateUpdate = (field, showname, newDate) => {
    //console.log('handling date update', field, showname, newDate);
    setFormState((prevState) => ({
      ...prevState,
      [field.key]: newDate.toLocaleDateString(), //year/month/day
    }));
    setDateStates((prevState) => ({
      ...prevState,
      [showname]: false, //should set dob or whatever date to the date text.
    }));
  };

  const toggleDateShow = (field, showname) => {
    let curState = dateStates[showname];
    setDateStates((prevState) => ({
      ...prevState,
      [showname]: !curState,
    }));
  };

  const updateBool = (field) => {
    const oldState = formState[field.key];
    setFormState((prevState) => ({
      ...prevState,
      [field.key]: !oldState,
    }));
  };

  const renderInput = (field) => {
    if (field.type === 'date') {
      let showname = `show${field.key}`;
      return (
        <DatePicker
          key={field.key}
          updateForm={handleDateUpdate}
          toggleShow={toggleDateShow}
          visible={dateStates[showname]}
          field={field}
        />
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
        <BoolInput
          value={formState[field.key]}
          updateBool={updateBool}
          field={field}
        />
      );
    } else {
      //custom picker
      return (
        <CustomDataPicker
          updateForm={handleFormUpdate}
          field={field}
        ></CustomDataPicker>
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
          <Dialog
            visible={visible}
            onDismiss={() => {
              setFormState({});
              setVisible(false);
            }}
            onClose={() => {
              defaultState();
            }}
          >
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

export default AddToOnlineQueue;
