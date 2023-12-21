import React, { useState, useEffect } from 'react';
import { Text, View, Keyboard } from 'react-native';
import { TextInput } from '@react-native-material/core';
import { styles } from '../../style/styles';
/**
 * We ended up not using this, for some reason there was a bug that caused all text inputs to overwrite their values to whatever was entered here. Moved this to be just made in the parent instead of imported.
 * @param {*} props
 * @returns
 */
const NumberInput = props => {
    const field = props.field;
    const [value, setValue] = useState(false);
    useEffect(() => {
        setValue(props.value);
    }, [props.value]);
    return (
        <View key={field.name} style={styles.row}>
            <Text style={styles.fieldName}>{field.name}:</Text>
            <View>
                <TextInput
                    keyboardType="number-pad"
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                    onChangeText={newText => {
                        // console.log('new text in field', field, newText);
                        props.updateForm(field, newText);
                    }}
                    style={styles.fieldInput}
                    required={field.required}
                    value={value}
                ></TextInput>
            </View>
        </View>
    );
};

export default NumberInput;
