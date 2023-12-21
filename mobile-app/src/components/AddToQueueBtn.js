import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Pressable } from '@react-native-material/core'

/**
 *
 * @param {*} props
 * @returns a styled button that submits a record onPress
 */
const AddToQueueBtn = props => {
    return (
        <View style={styles.wrapper}>
            <Pressable style={styles.btn} onPress={props.onPress} pressEffectColor="#4c5e75">
                <Text style={styles.btnText}>Add To Queue</Text>
            </Pressable>
        </View>
    )
}
const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        position: 'absolute',
        bottom: 12,
        right: 0,
    },
    btn: {
        alignSelf: 'flex-end',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        backgroundColor: '#A3CDFF',
        height: 50,
        width: 150,
        borderRadius: 10,
        overflow: 'hidden',
        marginRight: 20,
    },
    btnText: {
        fontSize: 22,
    },
})

export default AddToQueueBtn
