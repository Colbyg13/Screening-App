import React from 'react';
import { StyleSheet, View } from 'react-native';
import { PATIENT_RECORD_STATUS } from '../classes/patient-record';

//Returns the status circle for the progress tracker
export default function SessionQueueItemStatus(props) {
    const person = props.person;

    return (
        <View style={styles.statusWrapper}>
            {person.progress.map((status, i, {length}) => (
                <React.Fragment key={i}>
                    <View style={[styles.progressCircle, styles[status]]} />
                    {i !== length - 1 ? <View style={[styles.spacer, styles[status]]} /> : null}
                </React.Fragment>
            ))}
        </View>
    )
}

const styles = StyleSheet.create({
    statusWrapper: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    progressCircle: {
        aspectRatio: 1,
        height: '50%',
        borderWidth: 2,
        borderColor: 'black',
        borderRadius: 100,
    },
    spacer: {
        height: 2,
        width: 25,
        backgroundColor: 'black',
    },
    [PATIENT_RECORD_STATUS.COMPLETE]: {
        backgroundColor: 'green',
        borderColor: 'green',
    },
    [PATIENT_RECORD_STATUS.PARTIAL]: {
        backgroundColor: 'orange',
        borderColor: 'orange',
    },
    [PATIENT_RECORD_STATUS.NONE]: {},
})
