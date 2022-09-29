import { TextInput, Pressable } from '@react-native-material/core';
import {
  Provider,
  Button,
  Dialog,
  DialogHeader,
  DialogContent,
  DialogActions,
  Text,
  SafeAreaView,
} from '@react-native-material/core';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { useSessionContext } from '../contexts/SessionContext';

const UpdateRecordScreen = ({ route }) => {
  const navigation = useNavigation();
  const { sendRecord, selectedStation: station } = useSessionContext();
  const [formState, setFormState] = useState({}); //used to keep track of inputs. 
  const [fields, setFields] = useState([]);
  record = route.params.item;
  console.log('selected record', record);
  console.log('selected station', station);
  return (
    <View style={styles.container}>
      <Text>UpdateRecord</Text>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    height: '100%',
    marginTop: StatusBar.currentHeight || 0,
    backgroundColor: '#ffffff',
  },
})

export default UpdateRecordScreen;
