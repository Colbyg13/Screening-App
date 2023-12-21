import React, { useState, useEffect } from 'react';
import { Text, View, Switch } from 'react-native';
import { styles } from '../../style/styles';

/**
 *
 * @param {the field being rendered, and the current value from the parent} props
 * @returns a true or false switch with a label for the field name.
 */
const BoolInput = props => {
    const field = props.field;
    const [value, setValue] = useState(false);
    useEffect(() => {
        setValue(props.value);
    }, [props.value]);
    return (
        <View key={field.name} style={styles.row}>
            <Text style={styles.fieldName}>{field.name}:</Text>
            <View>
                <Switch
                    ios_backgroundColor={'grey'}
                    onValueChange={() => {
                        props.updateBool(field);
                    }}
                    value={value}
                    style={styles.switch}
                ></Switch>
            </View>
        </View>
    );
};

export default BoolInput;
