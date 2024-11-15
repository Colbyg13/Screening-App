import { Pressable, TextInput } from '@react-native-material/core';
import React, { useEffect, useState } from 'react';
import { Keyboard, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import BoolInput from '../../components/Inputs/BoolInput';
import CustomDataPickerOffline from '../../components/Inputs/CustomDataPickerOffline';
import DatePicker from '../../components/Inputs/DatePicker';
import { useCustomDataTypesContext } from '../../contexts/CustomDataContext';
const OfflineAddRecordStep3 = ({ route, navigation }) => {
    const { customDataTypes } = useCustomDataTypesContext();
    const selectedDataTypes = [
        { name: 'ID', key: 'id', type: 'number' },
        ...route.params.selectedDataTypes,
    ];
    const [formState, setFormState] = useState({}); //used to keep track of inputs.
    const [dateStates, setDateStates] = useState({}); //keep track of date picker visibility
    const [fields, setFields] = useState([]); //loop through to create the form.
    const [visible, setVisible] = useState(false);

    const numFields = selectedDataTypes.length;

    const defaultState = () => {
        let newFields = [];
        for (let i = 0; i < numFields; i++) {
            const varName = selectedDataTypes[i].key;
            if (selectedDataTypes[i].type === 'date') {
                let showname = `show${varName}`;
                setDateStates(prevState => ({ ...prevState, [showname]: false }));
            }
            if (selectedDataTypes[i].type === 'bool') {
                setFormState(prevState => ({ ...prevState, [varName]: false }));
            } else {
                setFormState(prevState => ({ ...prevState, [varName]: undefined }));
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
        //sets the state for the form dynamically. I have not implemented validation yet.
    }, [formState]);

    const handleFormUpdate = (field, selectedItem) => {
        const customFieldData = customDataTypes.find(({ type }) => type === field.type);
        const customData = customFieldData ? { [field.key]: customFieldData.unit } : {};
        setFormState(prevState => ({
            ...prevState,
            [field.key]: selectedItem,
            customData: {
                ...prevState.customData,
                ...customData,
            },
        }));
    };
    //when a date input is selected it will update the records form state
    const handleDateUpdate = (field, showname, newDate) => {
        const customFieldData = customDataTypes.find(({ type }) => type === field.type);
        const customData = customFieldData ? { [field.key]: customFieldData.unit } : {};
        setFormState(prevState => ({
            ...prevState,
            [field.key]: newDate, //year/month/day
            customData: {
                ...prevState.customData,
                ...customData,
            },
        }));
        setDateStates(prevState => ({
            ...prevState,
            [showname]: false, //should set dob or whatever date to the date text.
        }));
    };
    //toggles the visibility of the datepicker
    const toggleDateShow = (field, showname) => {
        let curState = dateStates[showname];
        setDateStates(prevState => ({
            ...prevState,
            [showname]: !curState,
        }));
    };
    //sets the value in the form state.
    const updateBool = field => {
        const oldState = formState[field.key];
        const customFieldData = customDataTypes.find(({ type }) => type === field.type);
        const customData = customFieldData ? { [field.key]: customFieldData.unit } : {};
        setFormState(prevState => ({
            ...prevState,
            [field.key]: !oldState,
            customData: {
                ...prevState.customData,
                ...customData,
            },
        }));
    };

    const handleSubmit = () => {
        //go back a screen with new data and persist it there.
        navigation.navigate({
            name: 'Offline Records',
            params: { newRecord: formState },
            merge: true,
        });
    };

    const renderInput = field => {
        switch (field.type) {
            case 'date':
                let showname = `show${field.key}`;
                return (
                    <DatePicker
                        value={formState[field.key]}
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
                                onChangeText={newText => {
                                    const customFieldData = customDataTypes.find(
                                        ({ type }) => type === field.type,
                                    );
                                    const customData = customFieldData
                                        ? { [field.key]: customFieldData.unit }
                                        : {};
                                    setFormState(prevState => ({
                                        ...prevState,
                                        [field.key]: newText,
                                        customData: {
                                            ...prevState.customData,
                                            ...customData,
                                        },
                                    }));
                                }}
                                style={styles.fieldInput}
                                value={formState[field.key]}
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
                                keyboardType="number-pad"
                                returnKeyType="done"
                                onSubmitEditing={Keyboard.dismiss}
                                onChangeText={newText => {
                                    const customFieldData = customDataTypes.find(
                                        ({ type }) => type === field.type,
                                    );
                                    const customData = customFieldData
                                        ? { [field.key]: customFieldData.unit }
                                        : {};
                                    setFormState(prevState => ({
                                        ...prevState,
                                        [field.key]: +newText,
                                        customData: {
                                            ...prevState.customData,
                                            ...customData,
                                        },
                                    }));
                                }}
                                style={styles.fieldInput}
                                value={formState[field.key]}
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
            <KeyboardAwareScrollView
                style={styles.scrollView}
                resetScrollToCoords={{ x: 0, y: 0 }}
                scrollEnabled={true}
                showsVerticalScrollIndicator={true}
                persistentScrollbar={true}
                enableOnAndroid={true}
            >
                <Text style={styles.pageDirection}>Offline Record</Text>

                <View>
                    {selectedDataTypes.map(field => {
                        return renderInput(field);
                    })}
                </View>
            </KeyboardAwareScrollView>
            <View style={styles.wrapper}>
                <Pressable
                    style={styles.btnSubmit}
                    pressEffectColor="#4c5e75"
                    onPress={handleSubmit}
                >
                    <Text style={styles.btnText}>Submit</Text>
                </Pressable>
                <Pressable
                    style={styles.btnCancel}
                    pressEffectColor="#FCB8B8"
                    onPress={() => {
                        setFormState({});
                        navigation.goBack();
                    }}
                >
                    <Text style={styles.btnText}>Cancel</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
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

export default OfflineAddRecordStep3;
