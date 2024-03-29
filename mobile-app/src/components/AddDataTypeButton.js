import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Pressable } from '@react-native-material/core';

/**returns a button that opens a modal in the offlineStep1 to add a new data type. */
const AddDataTypeButton = props => {
    return (
        <View>
            <Pressable style={styles.btn} onPress={props.onPress} pressEffectColor="#4c5e75">
                <Text style={styles.btnText}>+ Data Type</Text>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
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
});

export default AddDataTypeButton;
