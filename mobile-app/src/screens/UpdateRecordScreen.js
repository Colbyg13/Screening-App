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
import {
  View,
  StyleSheet,
  StatusBar,
  Keyboard,
  Switch,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useSessionContext } from '../contexts/SessionContext';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const UpdateRecordScreen = ({ route }) => {
  const navigation = useNavigation();
  const record = route.params.item;
  const isStationOne = route.params.isStationOne;
  console.log('update screen', isStationOne);
  const { sendRecord, selectedStation: station } = useSessionContext();
  const [formState, setFormState] = useState({}); //used to keep track of inputs.
  const [dateStates, setDateStates] = useState({});
  const [fields, setFields] = useState([]);
  const numFields = station.fields.length;
  const [visible, setVisible] = useState(false); //opens the dialog/modal.
  const [hasStationInfo, setHasStationInfo] = useState(false); //displays current data for station in patient record section if available

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

  const checkForStationInfo = () => {
    fields.forEach((field) => {
      if (record.hasOwnProperty(field)) {
        console.log('field', field, 'exists in record', record);
        setHasStationInfo(true);
      } else {
        console.log('field', field, 'does not exist');
      }
    });
  };

  useEffect(() => {
    //sets the state for the form dynamically. I have not implemented validation yet.
    defaultState();
    setFormState((prevState) => ({ ...prevState, id: record.id })); //sets object id
  }, []);

  useEffect(() => {
    console.log('FORM STATE UPDATED', formState);
  }, [formState]);

  useEffect(() => {
    console.log('Fields after default state was called', fields);
    checkForStationInfo();
  }, [fields]);

  const handleSubmit = async () => {
    console.log('You pressed submit');
    console.log('Current State: ', formState);
    //Some validation function
    //call function to handle SOCKET EVENT TO ADD NEW RECORD TO SESSION/QUEUE
    //On success open dialog with new ID, name, and DOB
    //On dialog close go back to session and update list of patients
    const result = await sendRecord(formState);
    console.log('update result', result);
    setVisible(true);
  };
  const renderInput = (field) => {
    console.log('input type', field.type);

    if (field.type === 'date') {
      let showname = `show${field.key}`;
      console.log(showname);
      return (
        <View key={field.name} style={styles.row}>
          <Text style={styles.fieldName}>
            {field.name}: {formState[field.key]}
          </Text>
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
              console.log('heyo', newDate);
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
    <Provider>
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.container}>
            <Text style={styles.pageDirection}>Patient Information</Text>
            <View style={styles.patientInfoWrapper}>
              <Text style={styles.patientInfoItem}>ID: {record.id}</Text>
              <Text style={styles.patientInfoItem}>Name: {record.name}</Text>
              <Text style={styles.patientInfoItem}>DOB: {record.dob}</Text>
              {hasStationInfo && (
                <>
                  {station.fields.map((field) => {
                    console.log('hello', field, record[field]);
                    return (
                      <Text style={styles.patientInfoItem}>
                        {field.name}: {record[field.key].toString()}
                      </Text>
                    );
                  })}
                </>
              )}
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
          <Dialog
            visible={visible}
            onDismiss={() => {
              setVisible(false);
              navigation.navigate('Current Session Queue');
            }}
          >
            <DialogHeader title='Information successfully updated!' />
            <DialogContent>
              <Text>Updated Info for {record.name}</Text>
              <Text>ID:{record.id}</Text>
              {fields.map((field) => {
                if (formState[field] === true || formState[field] === false) {
                  return (
                    <Text key={field.key}>
                      {station.fields.find(({ key }) => key === field)?.name}:{' '}
                      {formState[field].toString()}
                    </Text>
                  );
                } else {
                  return (
                    <Text key={field.key}>
                      {station.fields.find(({ key }) => key === field)?.name}:{' '}
                      {formState[field]}
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
    flex: 1,
    paddingTop: StatusBar.currentHeight,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    marginHorizontal: 10,
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
    alignSelf: 'flex-start',
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
    marginRight: 20,
    backgroundColor: '#FF6464',
    height: 50,
    width: 100,
    borderRadius: 10,
    overflow: 'hidden',
  },
  btnText: {
    fontSize: 22,
  },
});

export default UpdateRecordScreen;
