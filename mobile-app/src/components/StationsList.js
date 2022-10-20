import React from 'react';
import {
  Text,
  SafeAreaView,
  FlatList,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import StationsListItem from '../components/StationsListItem';
import { useSessionContext } from '../contexts/SessionContext';
const StationsList = (props) => {
  const {
    sessionInfo,
    sessionInfo: {
      stations = [],
    } = {},
    joinStation,
  } = useSessionContext();
  // console.log('Session info in Ipad', { sessionInfo })
  const navigation = useNavigation();
  const createLabels = () => {
    for(let i = 0; i < sessionInfo.stations.length; i++) {
      if(i < 10) {
        sessionInfo.stations[i].label = `0${i + 1}`;
      }
      else {
        sessionInfo.stations[i].label = `${i + 1}`;
      }
    }
  }
  createLabels();
  const handlePress = (item) => {
    joinStation(item.name);
    console.log('you pressed me', item);
    navigation.navigate('Current Session Queue');
  }
  const renderStationItem = ({ item }) => {
    return <StationsListItem key={item.id} onPress={() => handlePress(item)} item={item} />;
  };
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.pageDirection}>Select a station</Text>
      <FlatList
        data={stations}
        keyExtractor={item => item.id}
        renderItem={renderStationItem}
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
  pageDirection: {
    margin: 20,
    fontSize: 34,
    alignSelf: 'center',
  },
});

export default StationsList;
