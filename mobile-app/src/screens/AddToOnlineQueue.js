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
import { useCustomDataTypesContext } from '../contexts/CustomDataContext';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const AddToOnlineQueue = ({ route }) => {
  const navigation = useNavigation();
  const { customDataTypes } = useCustomDataTypesContext();
  const { sendRecord, selectedStation: station } = useSessionContext();
  const [formState, setFormState] = useState({}); //used to keep track of inputs.
  const [dateStates, setDateStates] = useState({});
  const [fields, setFields] = useState([]); //used to keep track of inputs and match them to the patient.
  const [visible, setVisible] = useState(false); //opens the dialog/modal.
  const [patient, setPatient] = useState({});
  // const station = route.params.station;
  const numFields = station.fields.length;

  //This function is how we dynamically build the input forms. It sets the state for each value in the station.fields and builds from there. All udpates must keep the previous formState.
  const defaultState = () => {
    let newFields = [];
    for (let i = 0; i < numFields; i++) {
      const varName = station.fields[i].key;
      if (station.fields[i].type === 'date') {
        //Dates need an additional state to track their visibility.
        let showname = `show${varName}`;
        setDateStates((prevState) => ({ ...prevState, [showname]: false }));
      }
      if (station.fields[i].type === 'bool') {
        //starts bools as false.
        setFormState((prevState) => ({ ...prevState, [varName]: false }));
      } else {
        //all other values are initially undefined so that DB updates don't overwrite anything on accident.
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
    // console.log(formState);
  }, [formState]);

  const handleSubmit = async () => {
    //Some validation function
    //call function to handle SOCKET EVENT TO ADD NEW RECORD TO SESSION/QUEUE
    //On success open dialog with new ID, name, and DOB
    //On dialog close go back to session and update list of patients
    const result = await sendRecord({
      record: formState,
      // puts only updated values in form into
      customData: customDataTypes.reduce((customData, { type, unit }) => {
        const usedField = station.fields.find((field) => field.type === type);
        const shouldAddKey =
          unit !== 'Custom' &&
          usedField &&
          formState[usedField.key] !== undefined;

        return shouldAddKey
          ? {
              ...customData,
              [usedField.key]: unit,
            }
          : customData;
      }, {}),
    });
    // let newId = Math.floor(Math.random() * 10); //this id will be given in the server
    setPatient((prevState) => ({ ...prevState, id: result.newId })); //on server success set the patient in state for display.

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
      [field.key]: newDate, //year/month/day
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
        <View key={field.key} style={styles.row}>
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
        <View key={field.key} style={styles.row}>
          <Text style={styles.fieldName}>{field.name}:</Text>
          <View>
            <TextInput
              keyboardType='number-pad'
              returnKeyType='done'
              onSubmitEditing={Keyboard.dismiss}
              onChangeText={(newText) => {
                // console.log(newText);
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
          key={field.key}
          value={formState[field.key]}
          updateBool={updateBool}
          field={field}
        />
      );
    } else {
      //custom picker
      return (
        <CustomDataPicker
          key={field.key}
          updateForm={handleFormUpdate}
          field={field}
        ></CustomDataPicker>
      );
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView
        style={styles.scrollView}
        resetScrollToCoords={{ x: 0, y: 0 }}
        scrollEnabled={true}
        showsVerticalScrollIndicator={true}
        persistentScrollbar={true}
        enableOnAndroid={true}
      >
        <Text style={styles.pageDirection}>Patient Information</Text>
        <View>
          {station.fields.map((field) => {
            return renderInput(field);
          })}
        </View>
      </KeyboardAwareScrollView>
      <View style={styles.wrapper}>
        <Pressable
          style={styles.btnCancel}
          pressEffect='ripple'
          pressEffectColor='#FCB8B8'
          onPress={() => {
            setFormState({});
            navigation.goBack();
          }}
        >
          <Text style={styles.btnText}>Cancel</Text>
        </Pressable>
        <Pressable
          style={styles.btnSubmit}
          pressEffect='ripple'
          pressEffectColor='#4c5e75'
          onPress={handleSubmit}
        >
          <Text style={styles.btnText}>Submit</Text>
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
          <Text style={{ fontSize: 24, marginTop: 10, marginBottom: 10, padding: 10 }}>
            New ID: {patient.id}
          </Text>
          {fields.map((field, index) => {
            if (patient.data[field] === true || patient.data[field] === false) {
              return (
                <React.Fragment key={index}>
                  <Text
                    style={{ fontSize: 24, marginTop: 10, marginBottom: 10, padding: 10 }}
                  >
                    {station.fields.find(({ key }) => key === field)?.name}:{' '}
                    {patient.data[field].toString()}
                  </Text>
                </React.Fragment>
              );
            } else if (formState[field] instanceof Date) {
              return (
                <React.Fragment key={index}>
                  <Text
                    style={{ fontSize: 24, marginTop: 10, marginBottom: 10, padding: 10 }}
                  >
                    {station.fields.find(({ key }) => key === field)?.name}:{' '}
                    {formState[field].toLocaleDateString()}
                  </Text>
                </React.Fragment>
              );
            } else {
              return (
                <React.Fragment key={index}>
                  <Text
                    style={{ fontSize: 24, marginTop: 10, marginBottom: 10, padding: 10 }}
                    key={field.name}
                  >
                    {station.fields.find(({ key }) => key === field)?.name}:{' '}
                    {patient.data[field]}
                  </Text>
                </React.Fragment>
              );
            }
          })}
        </DialogContent>
        <DialogActions>
          <Button
            title='Ok'
            variant='contained'
            onPress={() => {
              setVisible(false);
              navigation.navigate('Current Session Queue');
            }}
            style={{ padding: 5 }}
          />
        </DialogActions>
      </Dialog>
    </SafeAreaView>
  );
};

export default AddToOnlineQueue;
