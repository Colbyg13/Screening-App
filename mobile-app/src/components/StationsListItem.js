import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Pressable } from '@react-native-material/core'

//returns an item for station list, clicking on this moves a user into the session queue to gather data.
const StationsListItem = props => {
    const station = props.item
    // console.log(typeof(station));
    // console.log(station);
    return (
        <View>
            <Pressable style={styles.item} onPress={props.onPress} pressEffectColor="green">
                <View style={styles.row}>
                    <Text style={styles.label}>{station.label}</Text>
                    <View style={styles.TitleAndFields}>
                        <Text style={styles.title}>{station.name}</Text>
                        {station.fields.map(item => {
                            return (
                                <View key={item.name} style={styles.fieldsView}>
                                    <Text style={styles.fieldsitem}>{item.name}</Text>
                                </View>
                            )
                        })}
                    </View>
                </View>
            </Pressable>
        </View>
    )
}

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
    title: {
        marginBottom: 10,
        fontSize: 32,
    },
    fieldsitem: {
        fontSize: 22,
        margin: 5,
    },
    TitleAndFields: {
        marginLeft: 20,
        flex: 3,
    },
    label: {
        // textAlign: 'start', // This is breaking on Android
        fontSize: 65,
        fontWeight: '600',
        flex: 1,
        letterSpacing: 5,
    },
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-evenly',
    },
})

export default StationsListItem
