import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
} from 'react-native';
import { useSessionContext } from '../contexts/SessionContext';
import { TextInput } from '@react-native-material/core';
import AddToQueueBtn from './AddToQueueBtn';
import SessionQueueItem from './SessionQueueItem';
import { PATIENT_RECORD_STATUS } from '../classes/patient-record';

const SessionQueue = (props) => {
  const {
    sessionInfo: { stations },
    sessionRecords,
    selectedStation: station,
  } = useSessionContext();
  const stationIndex = stations.indexOf(station);
  const isStationOne = stations[0] === station;
  const [isSearching, setIsSearching] = React.useState(false);
  const [searchText, setSearchText] = React.useState('');
  const [filteredRecords, setFilteredRecords] = useState([]);
  const sortedRecords = [...sessionRecords].sort((recordA, recordB) => {

    if (recordA.nextStationIndex === recordB.nextStationIndex) {

      if (recordA.nextStationIndex === recordB.nextStationStatus) return recordA.lastModified <= recordB.lastModified ? -1 : 1;

      return recordA.nextStationStatus === PATIENT_RECORD_STATUS.PARTIAL ? -1 : 1;
    }
    // Puts our station next as first ones in the list
    if (recordA.nextStationIndex === stationIndex) return -1;
    if (recordB.nextStationIndex === stationIndex) return 1;
    // complete ones last in the list
    if (recordA.isComplete) return 1;
    if (recordB.isComplete) return -1;

    if ((recordA.nextStationIndex > stationIndex) && (recordB.nextStationIndex > stationIndex)) return recordA.nextStationIndex - recordB.nextStationIndex;
    
    if ((recordA.nextStationIndex > stationIndex) && (recordB.nextStationIndex < stationIndex)) return 1;

    if ((recordA.nextStationIndex < stationIndex) && (recordB.nextStationIndex > stationIndex)) return -1;

    return recordB.nextStationIndex - recordA.nextStationIndex;
  });

  useEffect(() => {
    setFilteredRecords([]);
    setSearchText('');
    setIsSearching(false);
  }, [sessionRecords]);

  const navigation = useNavigation();
  const handlePress = (item) => {
    navigation.navigate('Update Record', { item, isStationOne });
  };
  const handleAddToQueuePress = () => {
    navigation.navigate('Add To Queue', { station });
  };

  const handleSearchInput = (text) => {
    setSearchText(text);
    setIsSearching(text.length > 0);
  };

  useEffect(() => {
    searchForRecord();
  }, [isSearching, searchText]);
  console.log(sortedRecords[0]);
  const searchForRecord = () => {
    if (isSearching) {
      const foundRecord = sortedRecords.filter((record) =>
        record.id.toString().includes(searchText)
      );
      if (foundRecord.length > 0) {
        console.log('foundRecord', foundRecord);
        setFilteredRecords(foundRecord);
      } else {
        console.log('no record found');
        setFilteredRecords([]);
      }
    } else {
      console.log('not searching');
      setFilteredRecords([]);
    }
  };
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
      <TextInput
        keyboardType='number-pad'
        returnKeyType='done'
        placeholder='Search by ID'
        style={styles.searchBar}
        value={searchText}
        onChangeText={handleSearchInput}
      ></TextInput>
      {!isSearching && (
        <FlatList
          data={sortedRecords}
          keyExtractor={(item) => item.id}
          renderItem={renderQueueItem}
          style={styles.flatList}
        />
      )}
      {isSearching && (
        <FlatList
          data={filteredRecords}
          keyExtractor={(item) => item.id}
          renderItem={renderQueueItem}
          style={styles.flatList}
        />
      )}
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
    margin: 10,
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
    fontSize: 30,
    width: 200,
    padding: 1,
    alignSelf: 'center',
  },
});

export default SessionQueue;
