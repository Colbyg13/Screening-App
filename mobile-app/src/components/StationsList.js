import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  StyleSheet,
  StatusBar,
} from 'react-native';
import StationsListItem from '../components/StationsListItem';
import { useSessionContext } from '../contexts/SessionContext';
const StationsList = (props) => {
  // const stations = props.data.stations;

  const {
    sessionInfo,
    sessionInfo: {
      stations = [],
    } = {},
  } = useSessionContext();

  console.log({ sessionInfo })

  const handlePress = (item) => {
    console.log('you pressed me', item);
  }
  const renderStationItem = ({ item }) => {
    return <StationsListItem onPress={() => handlePress(item)} item={item} />;
  };
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.pageDirection}>Select a station</Text>
      <FlatList
        data={stations}
        renderItem={renderStationItem}
        keyExtractor={(item) => item.id}
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
