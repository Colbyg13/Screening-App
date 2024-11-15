import React from 'react';
import { Text, SafeAreaView, FlatList, StyleSheet, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import StationsListItem from '../components/StationsListItem';
import { useSessionContext } from '../contexts/SessionContext';
//returns the list of stations received from the session context. Clicking on a station lets an iPad start collecting data for those fields.
const StationsList = props => {
    const { sessionInfo, sessionInfo: { stations = [] } = {}, joinStation } = useSessionContext();
    const navigation = useNavigation();
    const createLabels = () => {
        for (let i = 0; i < stations.length; i++) {
            if (i < 10) {
                stations[i].label = `0${i + 1}`;
            } else {
                stations[i].label = `${i + 1}`;
            }
        }
    };
    createLabels();
    const handlePress = item => {
        joinStation(item.id);
        navigation.navigate('Current Session Queue');
    };
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
