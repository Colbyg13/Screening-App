import React from 'react';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView, Text, View, ScrollView, FlatList, StyleSheet } from 'react-native';
import { styles } from '../../style/styles';
import OfflineStationDataTypeItem from '../../components/OfflineStationDataTypeItem';
import NextButton from '../../components/NextButton';
import AddDataTypeButton from '../../components/AddDataTypeButton';
import {
    Provider,
    Button,
    Dialog,
    DialogHeader,
    DialogContent,
    DialogActions,
    TextInput,
} from '@react-native-material/core';
import SelectDropdown from 'react-native-select-dropdown';
import { useCustomDataTypesContext } from '../../contexts/CustomDataContext';

const originalTypes = ['string', 'number', 'date', 'bool'];
const IpadOfflineModeStep1 = ({ route, navigation }) => {
    const { customDataTypes } = useCustomDataTypesContext();
    const [standardDataTypes, setStandardDataTypes] = useState([]); //list of standard types from async storage
    const [selectedDataTypes, setSelectedDataTypes] = useState([]); //list of selected types based on switch
    const [isVisible, setIsVisible] = useState(false); //disable next button until at least one type is selected
    const STATION_FIELDS_STORAGE_KEY = 'sessionFields';

    //new data type dialog variables
    const [addNewTypeIsVisible, setAddNewTypeIsVisible] = useState(false);
    const [newFieldName, setNewFieldName] = useState('');
    const [newFieldKey, setNewFieldKey] = useState('');
    const [newFieldType, setNewFieldType] = useState('');
    const [needToStoreNewType, setNeedToStoreNewType] = useState(false);
    const [showDuplicateError, setShowDuplicateError] = useState(false);

    useEffect(() => {
        // initially get custom data from async storage
        AsyncStorage.getItem(STATION_FIELDS_STORAGE_KEY)
            // if there are custom Data types, then we don't want to override it because it came from the DB already
            .then(storedFieldsString =>
                setStandardDataTypes(dataTypes => JSON.parse(storedFieldsString) || []),
            );
    }, []);

    //   AsyncStorage.removeItem(SELECTED_DATA_TYPES_STORAGE_KEY);
    // }, []);

    const renderDataTypes = item => {
        const data = item.item;
        let isCustom = checkIsCustom(data);
        if (isCustom) {
            let customData = customDataTypes.find(dataType => dataType.type === data.name);

            return (
                <OfflineStationDataTypeItem
                    key={data._id}
                    item={data}
                    handleSelection={handleSelection}
                    type="custom"
                    customData={customData}
                />
            );
        } else {
            return (
                <OfflineStationDataTypeItem
                    key={data.key}
                    item={data}
                    handleSelection={handleSelection}
                    type="standard"
                />
            );
        }
    };

    const handleSelection = (data, value) => {
        if (value) {
            //if the switch is on, add the data type to the list
            setSelectedDataTypes(prevState => [...prevState, data]);
        } else {
            //if the switch is off, remove the data type from the list
            setSelectedDataTypes(prevState => prevState.filter(item => item.name !== data.name));
        }
    };

    const checkIsCustom = field => {
        if (
            field.type === 'string' ||
            field.type === 'number' ||
            field.type === 'bool' ||
            field.type === 'date'
        ) {
            return false;
        } else {
            return true;
        }
    };

    const handleNextPress = () => {
        if (selectedDataTypes.length >= 1) {
            navigation.navigate('Offline Records', {
                selectedDataTypes,
                customDataTypes,
            });
        } else {
            setIsVisible(prevState => !prevState);
        }
    };

    handleAddTypePress = () => {
        setAddNewTypeIsVisible(prevState => !prevState);
    };

    const handleDismiss = () => {
        setIsVisible(prevState => !prevState);
    };

    const handleNewTypeSubmit = () => {
        //check if newField name, key, and type are not empty

        if (newFieldName !== '' && newFieldKey !== '' && newFieldType !== '') {
            //check if newType name is not already in the list
            let isDuplicate = standardDataTypes.find(type => type.key === newFieldKey.trim());
            if (isDuplicate) {
                setShowDuplicateError(true);
            } else {
                setShowDuplicateError(false);
                let newType = {
                    name: newFieldName,
                    key: newFieldKey,
                    type: newFieldType,
                };
                setStandardDataTypes(prevState => [...prevState, newType]);
                setNeedToStoreNewType(true);
                setAddNewTypeIsVisible(prevState => !prevState);
                setNewFieldName('');
                setNewFieldKey('');
                setNewFieldType('');
            }
        }
    };

    useEffect(() => {
        if (needToStoreNewType) {
            storeStandardTypes();
        } else {
            return;
        }
    }, [needToStoreNewType]);

    const storeStandardTypes = async () => {
        if (standardDataTypes.length > 0) {
            try {
                const sorted = standardDataTypes.sort((a, b) => {
                    return a.key.localeCompare(b.key);
                });
                const jsonValue = JSON.stringify(sorted);
                await AsyncStorage.setItem(STATION_FIELDS_STORAGE_KEY, jsonValue);
                setNeedToStoreNewType(false);
            } catch (error) {
                console.log('error storing standard types', error);
            }
        } else return;
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.container}>
                <Text style={styles.pageDirection}>What data are you collecting?</Text>
                <FlatList
                    data={standardDataTypes}
                    keyExtractor={item => item.name}
                    renderItem={renderDataTypes}
                    style={styles.flatList}
                />
                <Dialog visible={isVisible} onDismiss={() => setIsVisible(false)}>
                    <DialogHeader title="No Selection Made" />
                    <DialogContent>
                        <Text style={{ fontSize: 20 }}>
                            Please select at least one data type to continue to the next step.
                        </Text>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            title="Cancel"
                            compact
                            color="#FF6464"
                            onPress={() => setIsVisible(false)}
                        />
                        <Button
                            title="Ok"
                            compact
                            color="#A3CDFF"
                            style={{ marginLeft: 10, marginRight: 10 }}
                            onPress={() => setIsVisible(false)}
                        />
                    </DialogActions>
                </Dialog>
                <View style={ButtonStyles.buttonWrapper}>
                    <AddDataTypeButton onPress={handleAddTypePress} />
                    <NextButton onPress={handleNextPress} />
                    <Dialog
                        visible={addNewTypeIsVisible}
                        onDismiss={() => setAddNewTypeIsVisible(false)}
                    >
                        <DialogHeader title="Add New Data Type" style={{ color: 'red' }} />
                        <DialogContent>
                            {showDuplicateError && (
                                <Text style={{ fontSize: 20, color: 'red', marginBottom: 15 }}>
                                    A field with this name/key already exists. Please enter a new
                                    name.
                                </Text>
                            )}
                            <Text style={styles.fieldName}>Field Name</Text>
                            <View>
                                <TextInput
                                    onChangeText={newText => {
                                        setNewFieldName(newText);
                                        setNewFieldKey(newText.toLowerCase());
                                    }}
                                    style={styles.fieldInput}
                                ></TextInput>
                            </View>
                            <View>
                                <View>
                                    <SelectDropdown
                                        buttonStyle={{ width: '75%' }}
                                        data={originalTypes}
                                        onSelect={(selectedItem, index) => {
                                            setNewFieldType(selectedItem);
                                        }}
                                        rowTextForSelection={(item, index) => {
                                            // text represented for each item in dropdown
                                            // if data array is an array of objects then return item.property to represent item in dropdown
                                            return item;
                                        }}
                                        keyExtractor={(item, index) => {
                                            return item.key;
                                        }}
                                    />
                                </View>
                            </View>
                        </DialogContent>
                        <DialogActions>
                            <Button
                                title="Cancel"
                                compact
                                color="#FF6464"
                                onPress={() => {
                                    setAddNewTypeIsVisible(false);
                                    setShowDuplicateError(false);
                                    setNewFieldName('');
                                    setNewFieldKey('');
                                    setNewFieldType('');
                                }}
                            />
                            <Button
                                title="Ok"
                                compact
                                color="#A3CDFF"
                                style={{ marginLeft: 10, marginRight: 10 }}
                                onPress={handleNewTypeSubmit}
                            />
                        </DialogActions>
                    </Dialog>
                </View>
            </View>
        </SafeAreaView>
    );
};

const ButtonStyles = StyleSheet.create({
    buttonWrapper: {
        marginTop: 20,
        marginBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
});

export default IpadOfflineModeStep1;
