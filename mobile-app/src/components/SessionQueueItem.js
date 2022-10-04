import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Pressable } from '@react-native-material/core';
import SessionQueueItemStatus from './SessionQueueItemStatus';

const SessionQueueItem = (props) => {
  const person = props.item;
  // console.log('person', person);
  return (
    <Pressable
      key={person.id}
      style={styles.item}
      onPress={props.onPress}
      pressEffect='ripple'
      pressEffectColor='green'
    >
      <View style={styles.innerContent}>
        <View style={styles.itemWrapper}>
          <Text style={styles.title}>Name: {person.name}</Text>
          <View key={person.name} style={styles.fieldsView}>
            <Text style={styles.fieldsitem}>ID: {person.id}</Text>
            <Text style={styles.fieldsitem}>DOB: {person.birthday}</Text>
          </View>
        </View>
        <View style={styles.statusWrapper}>
          <SessionQueueItemStatus person={person} />
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
  innerContent: {
    display: 'flex',
    flexDirection: 'row',
    // justifyContent: 'space-between',
    marginHorizontal: 40,
  },
  itemWrapper: {
    flex: 1,
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
  statusWrapper: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignContent: 'center',
  }
});

export default SessionQueueItem;
