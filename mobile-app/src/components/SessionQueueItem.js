import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Pressable } from '@react-native-material/core';

const SessionQueueItem = (props) => {
  const person = props.item;
  console.log('person', person);
  return (
    <Pressable
      key={person.id}
      style={styles.item}
      onPress={props.onPress}
      pressEffect='ripple'
      pressEffectColor='green'
    >
      <View>
        <Text style={styles.title}>Name: {person.name}</Text>
        <View key={person.name} style={styles.fieldsView}>
          <Text style={styles.fieldsitem}>ID: {person.id}</Text>
          <Text style={styles.fieldsitem}>DOB: {person.dob}</Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  item: {
    flex: 1,
    backgroundColor: '#EDEDED',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 10,
    overflow: 'hidden',
  },
  title: {
    marginBottom: 10,
    fontSize: 32,
    fontWeight: '500',
  },
  fieldsView: {
    alignItems: 'start',
  },
  fieldsitem: {
    fontSize: 22,
    margin: 5,
  },
});

export default SessionQueueItem;
