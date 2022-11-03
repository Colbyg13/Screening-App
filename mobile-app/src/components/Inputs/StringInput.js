import React from 'react';
import { Text, View } from 'react-native';
import { TextInput } from '@react-native-material/core';
import { styles } from '../../style/styles';

const StringInput = (props) => {
  field = props.field;
  console.log('field in textinput', field);
  return (
    <View key={field.name} style={styles.row}>
      <Text style={styles.fieldName}>{field.name}:</Text>
      <View>
        <TextInput
          key={field.name}
          onChangeText={(newText) => {
            props.updateForm(field, newText);
          }}
          style={styles.fieldInput}
          required={field.required}
        ></TextInput>
      </View>
    </View>
  );
};

export default StringInput;
