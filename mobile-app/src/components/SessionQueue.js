import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import SessionQueueItem from './SessionQueueItem';
const mockData = [
  {
    id: 1,
    name: 'Colby G',
  },
  {
    id: 2,
    name: 'John Doe',
  },
  {
    id: 3,
    name: 'Austin P',
  },
  {
    id: 4,
    name: 'Samantha G',
  },
  {
    id: 5,
    name: 'Jessica S',
  },
  {
    id: 6,
    name: 'Tony Stark',
  },
  {
    id: 7,
    name: 'Bruce Wayne',
  },
];
const SessionQueue = (props) => {
  const handlePress = (item) => {
    //const selectedStation = item
    console.log('you pressed me', item);
    //navigation.navigate('Current Session Queue', { selectedStation });
  };
  const renderQueueItem = ({ item }) => {
    return (
      <SessionQueueItem
        key={item.id}
        onPress={() => handlePress(item)}
        item={item}
      />
    );
  };
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.stationTitle}>{props.station.title}</Text>
      <Text style={styles.pageDirection}>Current Session</Text>
      <FlatList
        data={mockData}
        keyExtractor={(item) => item.id}
        renderItem={renderQueueItem}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
    backgroundColor: '#ffffff',
  },
  item: {
    backgroundColor: '#f9c2ff',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 32,
  },
  stationTitle: {
    margin: 10,
    fontSize: 22,
    alignSelf: 'flex-end',
    fontWeight: '200',

  },
  pageDirection: {
    margin: 20,
    fontSize: 34,
    alignSelf: 'center',
  },
});

export default SessionQueue;
