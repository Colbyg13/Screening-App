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
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useSessionContext } from '../contexts/SessionContext';
import BoolInput from '../components/Inputs/BoolInput';
import CustomDataPicker from '../components/Inputs/CustomDataPicker';
import DatePicker from '../components/Inputs/DatePicker';
import { useCustomDataTypesContext } from '../contexts/CustomDataContext';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

//this screen is to update a record during an online station. Displays the previously selected values for the record if any exist. 
const UpdateRecordScreen = ({ route }) => {
  const navigation = useNavigation();
  const { customDataTypes } = useCustomDataTypesContext();
  const record = route.params.item;
  const {
    sendRecord,
    selectedStation: station,
    stations,
  } = useSessionContext();
  const isStationOne = station.id === 1;
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
      if (record.hasOwnProperty(varName)) {
        setFormState((prevState) => ({
          ...prevState,
          [varName]: record[station.fields[i].key],
        }));
      } else {
        if (station.fields[i].type === 'date') {
          let showname = `show${varName}`;
          setDateStates((prevState) => ({ ...prevState, [showname]: false }));
        }
        if (station.fields[i].type === 'bool') {
          setFormState((prevState) => ({ ...prevState, [varName]: false }));
        } else {
          setFormState((prevState) => ({ ...prevState, [varName]: undefined }));
        }
      }
      newFields.push(varName);
    }
    setFields(newFields);
  };

  const checkForStationInfo = () => {
    fields.forEach((field) => {
      if (record.hasOwnProperty(field)) {
        //console.log('field', field, 'exists in record', record);
        setHasStationInfo(true);
      } else {
        //console.log('field', field, 'does not exist');
      }
    });
  };

  useEffect(() => {
    //sets the state for the form dynamically. I have not implemented validation yet.
    defaultState();
    setFormState((prevState) => ({ ...prevState, id: record.id })); //sets object id
  }, []);

  useEffect(() => {
    //console.log('FORM STATE UPDATED', formState);
  }, [formState]);

  useEffect(() => {
    //console.log('Fields after default state was called', fields);
    checkForStationInfo();
  }, [fields]);

  const handleFormUpdate = (field, selectedItem) => {
    //console.log('handling update', field, selectedItem);
    setFormState((prevState) => ({
      ...prevState,
      [field.key]: selectedItem, //year/month/day
    }));
  };

  const handleDateUpdate = (field, showname, newDate) => {
    // console.log('handling date update', field, showname, newDate);
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

  const handleSubmit = async () => {
    //Some validation function
    //call function to handle SOCKET EVENT TO ADD NEW RECORD TO SESSION/QUEUE
    //On success open dialog with new ID, name, and DOB
    //On dialog close go back to session and update list of patients
    const result = await sendRecord({
      record: formState,
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
    setVisible(true);
  };
  const renderInput = (field) => {
    if (field.type === 'date') {
      let showname = `show${field.key}`;
      return (
        <React.Fragment key={field.key}>
          <DatePicker
            value={formState[field.key]}
            updateForm={handleDateUpdate}
            toggleShow={toggleDateShow}
            visible={dateStates[showname]}
            field={field}
          />
        </React.Fragment>
      );
    } else if (field.type === 'string') {
      return (
        <React.Fragment key={field.key}>
          <View style={styles.row}>
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
        </React.Fragment>
      );
    } else if (field.type === 'number') {
      return (
        <React.Fragment key={field.key}>
          <View style={styles.row}>
            <Text style={styles.fieldName}>{field.name}:</Text>
            <View>
              <TextInput
                value={formState[field.key]}
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
        </React.Fragment>
      );
    } else if (field.type === 'bool') {
      return (
        <React.Fragment key={field.key}>
          <BoolInput
            style={styles.row}
            value={formState[field.key]}
            updateBool={updateBool}
            field={field}
          />
        </React.Fragment>
      );
    } else {
      //custom picker
      return (
        <React.Fragment key={field.key}>
          <CustomDataPicker
            style={styles.row}
            value={formState[field.key]}
            updateForm={handleFormUpdate}
            field={field}
          ></CustomDataPicker>
        </React.Fragment>
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
        <View style={styles.container}>
          <Text style={styles.pageDirection}>Patient Information</Text>
          <View style={styles.patientInfoWrapper}>
            <Text style={styles.patientInfoItem}>ID: {record.id}</Text>
            <Text style={styles.patientInfoItem}>Name: {record.name}</Text>
          </View>
          <View>
            <Text style={styles.pageDirection}>{station.name} Data:</Text>
          </View>
          <View>
            {station.fields.map((field) => {
              return renderInput(field);
            })}
          </View>
        </View>
      </KeyboardAwareScrollView>
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
          onPress={() => {
            setFormState({});
            navigation.goBack();
          }}
        >
          <Text style={styles.btnText}>Cancel</Text>
        </Pressable>
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
          {fields.map((field, index) => {
            if (formState[field] === true || formState[field] === false) {
              return (
                <React.Fragment key={index}>
                  <Text>
                    {station.fields.find(({ key }) => key === field)?.name}:{' '}
                    {formState[field].toString()}
                  </Text>
                </React.Fragment>
              );
            } else if (formState[field] instanceof Date) {
              return (
                <React.Fragment key={index}>
                  <Text>
                    {station.fields.find(({ key }) => key === field)?.name}:
                    {formState[field].toLocaleDateString()}
                  </Text>
                </React.Fragment>
              );
            } else {
              return (
                <React.Fragment key={index}>
                  <Text>
                    {station.fields.find(({ key }) => key === field)?.name}:{' '}
                    {formState[field]}
                  </Text>
                </React.Fragment>
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
    </SafeAreaView>
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
    fontSize: 30,
  },
  row: {
    marginLeft: 10,
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
    marginTop: 20,
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

// {!isStationOne && (
//   <>
//     {hasStationInfo && (
//       <>
//         {station.fields.map((field, index) => {
//           console.log('hello', field, record[field.key]);
//           console.log('field.key', field.key);
//           if (
//             record[field.key] === undefined ||
//             record[field.key] === null
//           ) {
//             console.log('NO DATA FOR THIS FIELD', field);
//             return (
//               <React.Fragment key={index}>
//               <Text style={styles.patientInfoItem}>
//                 {field.name}:
//               </Text>
//               </React.Fragment>
//             );
//           } else {
//             return (
//               <React.Fragment key={index}>
//               <Text style={styles.patientInfoItem}>
//                 {field.name}: {record[field.key].toString()}
//               </Text>
//               </React.Fragment>
//             );
//           }
//         })}
//       </>
//     )}
//   </>
// )}
