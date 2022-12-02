import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Pressable } from '@react-native-material/core';

const OfflineRecordItem = (props) => {
  const person = props.item;
  return (
    <Pressable key={person.id} style={styles.item} onPress={props.onPress}>
      <View style={styles.innerContent}>
        <View style={styles.itemWrapper}>
          <Text style={styles.title}>ID: {person.id}</Text>
          {person.name && (
            <View key={person.name} style={styles.fieldsView}>
              <Text style={styles.fieldsitem}>Name: {person.name}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  item: {
    flex: 1,
    backgroundColor: '#EDEDED',
    padding: 10,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 10,
    overflow: 'hidden',
  },
  innerContent: {
    display: 'flex',
    flexDirection: 'row',
    // justifyContent: 'space-between',
    // marginHorizontal: 40,
  },
  itemWrapper: {
    flex: 1,
  },
  title: {
    marginBottom: 10,
    fontSize: 20,
    fontWeight: '500',
  },
  fieldsView: {
    alignItems: 'flex-start',
  },
  fieldsitem: {
    fontSize: 18,
    margin: 5,
  },
  statusWrapper: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
  },
});

export default OfflineRecordItem;
