import React from 'react'
import { StyleSheet, View } from 'react-native';
import { useSessionContext } from '../contexts/SessionContext';

const STATS = {
    COMPLETE: 'complete',
    PARTIAL: 'partial',
    NONE: 'none',
}

export default function SessionQueueItemStatus(props) {
    const person = props.person;
    const { sessionInfo: { stations = [] } } = useSessionContext();

    return (
        <View style={styles.statusWrapper}>
            {stations.map(({ fields }, i, { length }) => {
                const status = getFieldStatus(person, fields);
                return (
                    <>
                        <View style={[styles.progressCircle, styles[status]]} />
                        {i !== length - 1 ? <View style={[styles.spacer, styles[status]]} /> : null}
                    </>
                )
            })}
        </View>
    )
}

function getFieldStatus(person, fields) {
    return fields.every(({ key }) => {
        if (person[key] !== undefined) return STATS.COMPLETE;
        if (fields.some(({ key }) => person[key] !== undefined)) return STATS.PARTIAL;
        return STATS.NONE;
    })
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
    [STATS.COMPLETE]: {
        backgroundColor: 'green',
        borderColor: 'green',
    },
    [STATS.PARTIAL]: {
        backgroundColor: 'orange',
        borderColor: 'orange',
    },
    [STATS.NONE]: {},
})
