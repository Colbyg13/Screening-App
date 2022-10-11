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
import AddToQueueBtn from './AddToQueueBtn';
import { useSessionContext } from '../contexts/SessionContext';
const SessionQueue = (props) => {
  // const station = props.station;
  const {sessionInfo: {stations, records}, selectedStation: station} = useSessionContext();
  console.log(stations[0], station);
  const isStationOne = stations[0] === station;
  console.log('stations yo', {station, stations}, 'is s1', isStationOne)
  const navigation = useNavigation();
  const handlePress = (item) => {

    console.log('you pressed me', item);
    
    navigation.navigate('Update Record', { item });
  };
  const handleAddToQueuePress = () => {
    navigation.navigate('Add To Queue', { station });
  }

  //NEED SOCKET EVENT TO LISTEN FOR NEW DATA ADDED
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
      <Text style={styles.stationTitle}>{station?.title}</Text>
      <Text style={styles.pageDirection}>Current Session</Text>
      <Text style={styles.searchBar}>Search Bar will go here</Text>
      <FlatList
        data={records}
        keyExtractor={(item) => item.id}
        renderItem={renderQueueItem}
        style={styles.flatList}
      />
            {isStationOne && (
        <AddToQueueBtn onPress={handleAddToQueuePress}></AddToQueueBtn>
        )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
    backgroundColor: '#ffffff',
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
  flatList: {
    height: '70%',
    flexGrow: 0,
    padding: 5,
  },
  searchBar: {
    margin: 5,
    fontSize: 20,
    alignSelf: 'center',
  }
});

export default SessionQueue;
