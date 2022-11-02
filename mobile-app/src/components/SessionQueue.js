import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
  FlatList, SafeAreaView, StatusBar, StyleSheet, Text
} from 'react-native';
import { useSessionContext } from '../contexts/SessionContext';
import AddToQueueBtn from './AddToQueueBtn';
import SessionQueueItem from './SessionQueueItem';

const SessionQueue = (props) => {

  const { sessionInfo: { stations }, sessionRecords,  selectedStation: station } = useSessionContext();
  const stationIndex = stations.indexOf(station);
  const isStationOne = stations[0] === station;

  const sortedRecords = [...sessionRecords].sort((recordA, recordB) => {
    // secondary sorting
    if (recordA.nextStationIndex === recordB.nextStationIndex) return recordA.lastModified <= recordB.lastModified ? -1 : 1;
    // Puts our station next as first ones in the list
    if (recordA.nextStationIndex === stationIndex) return -1;
    if (recordB.nextStationIndex === stationIndex) return 1;
    // complete ones last in the list
    if (recordA.isComplete) return 1;
    if (recordB.isComplete) return -1;
    // if (
    //   ((recordA.nextStationIndex > stationIndex) && (recordB.nextStationIndex > stationIndex))
    //   ||
    //   ((recordA.nextStationIndex < stationIndex) && (recordB.nextStationIndex < stationIndex))
    // ) return recordA.nextStationIndex - recordB.nextStationIndex;
    return recordA.nextStationIndex - recordB.nextStationIndex;

    // if (recordA.nextStationIndex < stationIndex) return 1;
    // return -1;
  });
  // console.log({station, stations})
  // const [isStationOne, setIsStationOne] = useState(props.station.isStationOne);
  const navigation = useNavigation();
  const handlePress = (item) => {

    console.log('you pressed me', item);

    navigation.navigate('Update Record', { item, isStationOne });
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
        data={sortedRecords}
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
