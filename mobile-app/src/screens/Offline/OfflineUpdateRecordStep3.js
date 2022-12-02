import React, { useEffect, useState } from 'react';
import { SafeAreaView, Text, ScrollView, View, Keyboard } from 'react-native';
import { Pressable, TextInput } from '@react-native-material/core';
import { styles } from '../../style/styles';
import BoolInput from '../../components/Inputs/BoolInput';
import DatePicker from '../../components/Inputs/DatePicker';
import CustomDataPickerOffline from '../../components/Inputs/CustomDataPickerOffline';
import {
  Provider,
  Button,
  Dialog,
  DialogHeader,
  DialogContent,
  DialogActions,
} from '@react-native-material/core';
const OfflineAddRecordStep3 = ({ route, navigation }) => {
  const item = route.params.item;
  // console.log('HERE IS THE ITEM TO UPDATE', item);
  const customDataTypes = route.params.customDataTypes;
  const selectedDataTypes = [
    { name: 'ID', key: 'id', type: 'number' },
    ...route.params.selectedDataTypes,
  ];

  const [otherFields, setOtherFields] = useState([]);

  const [formState, setFormState] = useState({}); //used to keep track of inputs.
  const [dateStates, setDateStates] = useState({}); //keep track of date picker visibility
  const [fields, setFields] = useState([]); //loop through to create the form.
  const [isVisible, setIsVisible] = useState(false); //disable next button until at least one type is selected

  const numFields = selectedDataTypes.length;

  const defaultState = () => {
    let newFields = [];
    for (let i = 0; i < numFields; i++) {
      const varName = selectedDataTypes[i].key;
      // console.log('varName', varName);
      if (item.hasOwnProperty(varName)) {
        // console.log('item has property', varName);
        setFormState((prevState) => ({
          ...prevState,
          [varName]: item[varName],
        }));
      } else {
        if (selectedDataTypes[i].type === 'date') {
          let showname = `show${varName}`;
          setDateStates((prevState) => ({ ...prevState, [showname]: false }));
        }
        if (selectedDataTypes[i].type === 'bool') {
          setFormState((prevState) => ({ ...prevState, [varName]: false }));
        } else {
          setFormState((prevState) => ({ ...prevState, [varName]: undefined }));
        }
      }
      newFields.push(varName);
    }
    for (let i = 0; i < Object.keys(item).length; i++) {
      if (!formState.hasOwnProperty(Object.keys(item)[i])) {
        setFormState((prevState) => ({
          ...prevState,
          [Object.keys(item)[i]]: item[Object.keys(item)[i]],
        }));
        //setOtherFields((prevState) => [...prevState, Object.keys(item)[i]]);
        //How do we want to handle other fields? We'd send all the possible types in order to render an input.
      }
    }
    setFields(newFields);
  };

  useEffect(() => {
    //sets the state for the form dynamically. I have not implemented validation yet.
    defaultState();
  }, []);

  useEffect(() => {
    //sets the state for the form dynamically. I have not implemented validation yet.
    // console.log('formState updated', formState);
  }, [formState]);

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

  const handleSubmit = () => {
    // console.log('formState before submit', formState);
    if (checkIDChange()) {
      //show dialog
      setIsVisible(true);
    } else { //no ID change
      // console.log('formState before submit button', formState);
      navigation.navigate({
        name: 'Offline Records',
        params: { updatedRecord: formState, oldRecordID: item.id },
        merge: true,
      });
    }
  };

  /**
   * 
   * @returns true if the ID has changed, false otherwise
   */
  const checkIDChange = () => {
    if (item.id != formState.id) {
      return true;
    } else {
      return false;
    }
  };

  /**
   * 
   * @param {field} field 
   * @returns an input component based on the type of the field
   */
  const renderInput = (field) => {
    switch (field.type) {
      case 'date':
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
      case 'string':
        return (
          <View key={field.key} style={styles.row}>
            <Text style={styles.fieldName}>{field.name}:</Text>
            <View>
              <TextInput
                value={formState[field.key]}
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
      case 'number':
        return (
          <View key={field.key} style={styles.row}>
            <Text style={styles.fieldName}>{field.name}:</Text>
            <View>
              <TextInput
                value={String(formState[field.key])}
                keyboardType='number-pad'
                returnKeyType='done'
                onSubmitEditing={Keyboard.dismiss}
                onChangeText={(newText) => {
                  // console.log(newText);
                  setFormState((prevState) => ({
                    ...prevState,
                    [field.key]: +newText,
                  }));
                }}
                style={styles.fieldInput}
                required={field.required}
              ></TextInput>
            </View>
          </View>
        );
      case 'bool':
        return (
          <BoolInput
            key={field.key}
            value={formState[field.key]}
            updateBool={updateBool}
            field={field}
          />
        );
      default:
        return (
          <CustomDataPickerOffline
            key={field.key}
            customFields={customDataTypes}
            updateForm={handleFormUpdate}
            field={field}
          ></CustomDataPickerOffline>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={true}
        persistentScrollbar={true}
      >
        <Text style={styles.pageDirection}>Update Record</Text>

        <View>
          {selectedDataTypes.map((field) => {
            return renderInput(field);
          })}
        </View>
      </ScrollView>
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
          onPress={() => {
            setFormState({});
            navigation.goBack();
          }}
        >
          <Text style={styles.btnText}>Cancel</Text>
        </Pressable>
      </View>

      <Dialog visible={isVisible} onDismiss={() => setIsVisible(false)}>
        <DialogHeader title='Updating ID Warning' />
        <DialogContent>
          <Text style={{ fontSize: 20 }}>
            You are about to change the ID on this record. Are you sure you want to
            continue?
          </Text>
          <Text style={{ marginTop: 10, fontSize: 22, fontWeight: 'bold' }}>
            Old ID: {item.id}
          </Text>
          <Text style={{ marginTop: 10, fontSize: 22, fontWeight: 'bold' }}>
            New ID: {formState.id}
          </Text>
        </DialogContent>
        <DialogActions>
          <Button
            title='Cancel'
            compact
            color='#FF6464'
            onPress={() => {
              setFormState((prevState) => ({
                ...prevState,
                ID: item.id,
              }));
              setIsVisible(false);
            }}
          />
          <Button
            title='I understand'
            compact
            color='#A3CDFF'
            style={{ marginLeft: 10, marginRight: 10 }}
            onPress={() => {
              setIsVisible(false);
              // console.log('formState before submit in dialog', formState);
              navigation.navigate({
                name: 'Offline Records',
                params: { updatedRecord: formState, oldRecordID: item.id},
                merge: true,
              });
            }}
          />
        </DialogActions>
      </Dialog>
    </SafeAreaView>
  );
};

export default OfflineAddRecordStep3;
