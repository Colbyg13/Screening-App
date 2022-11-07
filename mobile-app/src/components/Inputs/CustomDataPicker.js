import React from 'react';
import { Text, View, Keyboard } from 'react-native';
import { TextInput } from '@react-native-material/core';
import { useCustomDataTypesContext } from '../../contexts/CustomDataContext';
import SelectDropdown from 'react-native-select-dropdown';
import { styles } from '../../style/styles';
const CustomDataPicker = (props) => {
  const field = props.field;
  const { customDataTypes } = useCustomDataTypesContext();
  let customData = customDataTypes.filter((item) => {
    return item.type == field.type;
  });

  if (customData[0].values === null) {
    //Not a dropdown, return text input with label for units
    return (
      <View key={field.name} style={styles.row}>
        <Text style={styles.fieldName}>
          {field.name}: ({customData[0].unit})
        </Text>
        <View>
          <TextInput
            keyboardType='number-pad'
            returnKeyType='done'
            onSubmitEditing={Keyboard.dismiss}
            onChangeText={(newText) => {
              console.log(newText);
              props.updateForm(field, newText);
            }}
            style={styles.fieldInput}
            required={field.required}
          ></TextInput>
        </View>
      </View>
    );
  } else {
    let items = [];
    console.log('custom data from DB', customData);
    customData[0].values.forEach((element) => {
      let obj = {
        label: element,
        value: element,
      };
      items.push(obj);
    });

    return (
      <View key={field.name} style={styles.row}>
        <Text style={styles.fieldName}>{field.name}:</Text>
        <View>
          <SelectDropdown
            data={customData[0].values}
            onSelect={(selectedItem, index) => {
              console.log(selectedItem, index);
              props.updateForm(field, selectedItem);
            }}
            rowTextForSelection={(item, index) => {
              // text represented for each item in dropdown
              // if data array is an array of objects then return item.property to represent item in dropdown
              return item;
            }}
          />
        </View>
      </View>
    );
  }
};

export default CustomDataPicker;
