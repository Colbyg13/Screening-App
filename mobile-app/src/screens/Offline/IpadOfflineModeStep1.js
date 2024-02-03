import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogHeader,
    TextInput
} from '@react-native-material/core';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import SelectDropdown from 'react-native-select-dropdown';
import AddDataTypeButton from '../../components/AddDataTypeButton';
import NextButton from '../../components/NextButton';
import OfflineStationDataTypeItem from '../../components/OfflineStationDataTypeItem';
import { useCustomDataTypesContext } from '../../contexts/CustomDataContext';
import { STATION_FIELDS_STORAGE_KEY } from '../../contexts/SessionContext';
import { styles } from '../../style/styles';

const originalTypes = ['string', 'number', 'date', 'bool'];
const IpadOfflineModeStep1 = ({ navigation }) => {
    const { customDataTypes } = useCustomDataTypesContext();
    const [standardDataTypes, setStandardDataTypes] = useState([]); //list of standard types from async storage
    const [selectedDataTypes, setSelectedDataTypes] = useState([]); //list of selected types based on switch
    const [isVisible, setIsVisible] = useState(false); //disable next button until at least one type is selected

    //new data type dialog variables
    const [addNewTypeIsVisible, setAddNewTypeIsVisible] = useState(false);
    const [newFieldName, setNewFieldName] = useState('');
    const [newFieldType, setNewFieldType] = useState('');
    const [showDuplicateError, setShowDuplicateError] = useState(false);

    useEffect(() => {
        // initially get custom data from async storage
        AsyncStorage.getItem(STATION_FIELDS_STORAGE_KEY)
            // if there are custom Data types, then we don't want to override it because it came from the DB already
            .then(existingFieldsJSON => {
                const existingFields = existingFieldsJSON ? JSON.parse(existingFieldsJSON) : [];
                const filteredFields = existingFields.filter(({ key }) => key !== 'id')
                setStandardDataTypes(filteredFields);
            });
    }, []);

    const renderDataTypes = item => {
        const data = item.item;
        const customData = customDataTypes.find(dataType => dataType.type === data.name);

        return (
            <OfflineStationDataTypeItem
                key={data.key}
                item={data}
                handleSelection={handleSelection}
                handleDelete={handleDelete}
                customData={customData}
            />
        );
    };

    const handleSelection = (data, value) => {
        if (value) {
            //if the switch is on, add the data type to the list
            setSelectedDataTypes(prevState => [...prevState, data]);
        } else {
            //if the switch is off, remove the data type from the list
            setSelectedDataTypes(prevState => prevState.filter(item => item.key !== data.key));
        }
    };

    const handleDelete = (field) => {
        const newStandardTypes = standardDataTypes.filter(f => f.key !== field.key);

        setStandardDataTypes(newStandardTypes);
        AsyncStorage.setItem(STATION_FIELDS_STORAGE_KEY, JSON.stringify(newStandardTypes));
    };

    const handleNextPress = () => {
        if (selectedDataTypes.length >= 1) {
            navigation.navigate('Offline Records', {
                selectedDataTypes,
            });
        } else {
            setIsVisible(true);
        }
    };

    handleAddTypePress = () => {
        setAddNewTypeIsVisible(true);
    };

    const handleNewTypeSubmit = () => {
        //check if newField name, key, and type are not empty

        if (newFieldName.trim() !== '' && newFieldType.trim() !== '') {

            const newFieldKey = _.camelCase(newFieldName.toLowerCase())

            //check if newType name is not already in the list
            const isDuplicate = standardDataTypes.find(type => type.key === newFieldKey);
            if (isDuplicate) {
                setShowDuplicateError(true);
            } else {
                setShowDuplicateError(false);
                const newType = {
                    name: newFieldName,
                    key: newFieldKey,
                    type: newFieldType,
                };

                const newStandardTypes = [...standardDataTypes, newType].sort((a, b) => a.key < b.key ? -1 : 1);

                AsyncStorage.setItem(STATION_FIELDS_STORAGE_KEY, JSON.stringify(newStandardTypes));
                setStandardDataTypes(newStandardTypes);
                setAddNewTypeIsVisible(false);
                setNewFieldName('');
                setNewFieldType('');
            }
        }
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
