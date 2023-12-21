import React, { useState, useEffect } from 'react'
import { View, Text, SafeAreaView, FlatList, Keyboard } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { styles } from '../../style/styles'
import AddOfflineRecordBtn from '../../components/AddOfflineRecordBtn'
import OfflineRecordItem from '../../components/OfflineRecordItem'

import {
    Provider,
    Button,
    Dialog,
    DialogHeader,
    DialogContent,
    DialogActions,
    TextInput,
} from '@react-native-material/core'

export const LOCAL_RECORDS_STORAGE_KEY = 'LOCAL_RECORDS'

const OfflineRecordsScreenStep2 = ({ route, navigation }) => {
    const [records, setRecords] = useState([]) //array to hold records list
    const customDataTypes = route.params.customDataTypes
    const selectedDataTypes = route.params.selectedDataTypes
    const [newRecord, setNewRecord] = useState(null) //object to hold new record
    const [needsToStoreData, setNeedsToStoreData] = useState(false) //boolean to determine if new record needs to be stored
    const [needsUpdate, setNeedsUpdate] = useState(true) //boolean to trigger update of records list
    const [replacementID, setReplacementID] = useState(null) //string to hold ID of record to be replaced
    const [isVisible, setIsVisible] = useState(false) //boolean to determine if dialog is visible
    const [idInUse, setIdInUse] = useState(null) //boolean to determine if ID is already in use
    const [idInUseType, setIdInUseType] = useState(null) //string to hold type of ID in use
    //AsyncStorage.removeItem('LOCAL_RECORDS'); //use this to clear local records
    useEffect(() => {
        if (needsUpdate) {
            retrieveRecords() //retrieve records from async storage
        } else {
            return
        }
    }, [needsUpdate])

    const retrieveRecords = async () => {
        try {
            const value = await AsyncStorage.getItem(LOCAL_RECORDS_STORAGE_KEY)
            if (value !== null) {
                // We have data!!
                setRecords(JSON.parse(value))
                setNeedsUpdate(false)
            }
        } catch (error) {
            // Error retrieving data
            console.log('no records found')
        }
    }

    const storeRecords = async () => {
        if (records.length > 0) {
            console.log('storing the records')
            try {
                const sorted = records.sort((a, b) => (a.id > b.id ? 1 : -1))
                const jsonValue = JSON.stringify(sorted)
                await AsyncStorage.setItem(LOCAL_RECORDS_STORAGE_KEY, jsonValue)
                setNeedsToStoreData(false)
                setNeedsUpdate(true)
            } catch (e) {
                // saving error
                console.log('error saving record')
            }
        } else return //no records to store
    }

    useEffect(() => {
        //should fire when a new record is submitted
        console.log('firing new record. ')
        if (route.params?.newRecord) {
            //check if ID is already in records
            const newRecord = route.params.newRecord
            const newRecordID = newRecord.id
            const found = records.find(record => record.id === newRecordID)
            if (found) {
                console.log('found a record with the same ID') //replace or ignore? for now, ignore
                setIdInUse(String(newRecordID))
                setIdInUseType('newRecord')
                setIsVisible(true)
                //if found, replace the record
                //display modal to ask if they want to replace the record or overwrite it
                return
            } else {
                const newRecord = route.params.newRecord
                setRecords(prevState => [...prevState, newRecord])
                setNeedsToStoreData(true)
                route.params.newRecord = null
            }
        }
    }, [route.params?.newRecord])

    useEffect(() => {
        //should fire when a new record is submitted

        if (route.params?.updatedRecord) {
            const updatedRecord = route.params.updatedRecord
            const oldRecordID = route.params.oldRecordID
            if (updatedRecord.id != oldRecordID) {
                //check if the new ID is already in use
                const found = records.find(record => record.id === updatedRecord.id)
                if (found) {
                    setIdInUseType('updatedRecord')
                    setIdInUse(String(updatedRecord.id))
                    setIsVisible(true)
                } else {
                    for (let i = 0; i < records.length; i++) {
                        if (records[i].id === oldRecordID) {
                            //find the record with the old ID
                            let update = [...records]
                            update[i] = updatedRecord //replace the record with the updated record and new ID
                            setRecords(update)
                            setNeedsToStoreData(true)
                        }
                    }
                }
            } else {
                //updating record, leave ID the same
                for (let i = 0; i < records.length; i++) {
                    if (records[i].id === updatedRecord.id) {
                        let update = [...records]
                        update[i] = updatedRecord
                        setRecords(update)
                        setNeedsToStoreData(true)
                    }
                }
            }
        }
    }, [route.params?.updatedRecord])

    useEffect(() => {
        if (route.params?.deleteRecord) {
            const deleteRecord = route.params.deleteRecord
            const filtered = records.filter(record => record.id !== deleteRecord)
            setRecords(filtered)
            setNeedsToStoreData(true)
        }
    }, [route.params?.deleteRecord])

    useEffect(() => {
        if (needsToStoreData) {
            storeRecords()
        } else {
            return
        }
    }, [needsToStoreData])

    const AddRecord = () => {
        setIsVisible(false)
        setReplacementID('')
        navigation.navigate('Offline Add Records', {
            customDataTypes,
            selectedDataTypes,
        })
    }

    const handlePress = item => {
        navigation.navigate('Offline Update Records', {
            item,
            customDataTypes,
            selectedDataTypes,
        })
    }

    const renderOfflineRecordItem = ({ item }) => {
        return <OfflineRecordItem item={item} key={item.id} onPress={() => handlePress(item)} />
    }

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.pageDirection}>Locally Stored Records</Text>
            <FlatList
                data={records}
                keyExtractor={item => item.id}
                renderItem={renderOfflineRecordItem}
                style={styles.flatList}
            />
            <Dialog visible={isVisible} onDismiss={() => setIsVisible(false)}>
                <DialogHeader title="ID already in use" />
                <DialogContent>
                    <Text style={{ fontSize: 20 }}>
                        Warning! The ID {idInUse} is already in use. Do you want to enter a new ID
                        or overwrite the existing record?
                    </Text>
                    <View style={styles.row}>
                        <Text style={styles.fieldName}>New ID:</Text>
                        <View>
                            <TextInput
                                value={replacementID}
                                keyboardType="number-pad"
                                returnKeyType="done"
                                onSubmitEditing={Keyboard.dismiss}
                                onChangeText={newText => {
                                    if (!isNaN(newText)) {
                                        setReplacementID(newText)
                                    }
                                }}
                                style={styles.fieldInput}
                            ></TextInput>
                        </View>
                    </View>
                </DialogContent>
                <DialogActions>
                    <Button
                        title="Overwrite"
                        compact
                        color="#FF6464"
                        onPress={() => {
                            let data = {}
                            switch (idInUseType) {
                                case 'newRecord':
                                    data = route.params.newRecord
                                    const dataID = data.id
                                    for (let i = 0; i < records.length; i++) {
                                        if (records[i].id === dataID) {
                                            let update = [...records]
                                            update[i] = data //replace the record with the updated record and new ID
                                            setRecords(update)
                                            setNeedsToStoreData(true)
                                        }
                                    }
                                    setIsVisible(false)
                                    break
                                case 'updatedRecord':
                                    data = route.params.updatedRecord
                                    const oldRecordID = route.params.oldRecordID

                                    for (let i = 0; i < records.length; i++) {
                                        //remove old record, and overwrite with new record
                                        if (records[i].id === oldRecordID) {
                                            //find the record with the old ID
                                            let update = [...records]
                                            update.splice(i, 1)
                                            for (let i = 0; i < update.length; i++) {
                                                if (update[i].id === +idInUse) {
                                                    update[i] = data
                                                    setRecords(update)
                                                    setNeedsToStoreData(true)
                                                    setIsVisible(false)
                                                    return
                                                }
                                            }
                                        }
                                    }
                                default:
                                    break
                            }
                        }}
                    />
                    <Button
                        title="Update ID"
                        compact
                        color="#A3CDFF"
                        style={{ marginLeft: 10, marginRight: 10 }}
                        onPress={() => {
                            if (replacementID != '') {
                                let found = records.find(record => record.id === +replacementID) //check if replacement ID is already in use, convert to number instead of string
                                if (found) {
                                    setIdInUse(String(replacementID))
                                    switch (idInUseType) {
                                        case 'newRecord':
                                            route.params.newRecord.id = +replacementID
                                            break
                                        case 'updatedRecord':
                                            route.params.updatedRecord.id = +replacementID
                                        default:
                                            break
                                    }
                                    setIsVisible(true)
                                    return
                                } else {
                                    //if not found, add the record
                                    let data = {}
                                    switch (idInUseType) {
                                        case 'newRecord':
                                            data = route.params.newRecord
                                            data.id = +replacementID
                                            break
                                        case 'updatedRecord':
                                            data = route.params.updatedRecord
                                            data.id = +replacementID
                                            const oldRecordID = route.params.oldRecordID

                                            for (let i = 0; i < records.length; i++) {
                                                //remove old record, and overwrite with new record
                                                if (records[i].id === oldRecordID) {
                                                    //find the record with the old ID
                                                    let update = [...records]
                                                    update.splice(i, 1) //remove the old record
                                                    update = [...update, data] //add the new record
                                                    setRecords(update)
                                                    setNeedsToStoreData(true)
                                                    setIsVisible(false)
                                                    return
                                                }
                                            }

                                        default:
                                            break
                                    }
                                    setRecords(prevState => [...prevState, data])
                                    setNeedsToStoreData(true)
                                    setIsVisible(false)
                                    setReplacementID('')
                                }
                            }
                        }}
                    />
                </DialogActions>
            </Dialog>
            <AddOfflineRecordBtn onPress={AddRecord} />
        </SafeAreaView>
    )
}

export default OfflineRecordsScreenStep2
