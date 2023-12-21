import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Pressable } from '@react-native-material/core'

/**
 *
 * @param {*} props
 * @returns a styled button that moves you to step 2 of the offline process
 */
const NextButton = props => {
    return (
        <View>
            <Pressable style={styles.btn} onPress={props.onPress} pressEffectColor="#4c5e75">
                <Text style={styles.btnText}>Next</Text>
            </Pressable>
        </View>
    )
}
const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
    },
    btn: {
        alignSelf: 'flex-end',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        backgroundColor: '#A3CDFF',
        height: 50,
        width: 125,
        borderRadius: 10,
        overflow: 'hidden',
    },
    btnText: {
        fontSize: 22,
    },
})

export default NextButton
