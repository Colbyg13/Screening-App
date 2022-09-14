import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Pressable } from '@react-native-material/core';

const StationsListItem = (props) => {
  station = props.item;
  return (
    <Pressable style={styles.item} onPress={props.onPress} pressEffect='ripple' pressEffectColor='green'>
      <View>
        <Text style={styles.title}>{station.title}</Text>
        {station.fields.map((item) => {
          return (
            <View style={styles.fieldsView}>
              <Text style={styles.fieldsitem}>{item.name}</Text>
            </View>
          );
        })}
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
  },
  title: {
    marginBottom: 10,
    fontSize: 30,
    alignSelf: 'center',
    textDecorationLine: true,
  },
  fieldsView: {
    alignItems: 'center',
  },
  fieldsitem: {
    fontSize: 22,
    margin: 5,
  }
});

export default StationsListItem;
