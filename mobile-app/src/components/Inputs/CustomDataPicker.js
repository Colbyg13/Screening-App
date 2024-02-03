import React, { useEffect } from 'react';
import { Text, View, Keyboard } from 'react-native';
import { TextInput } from '@react-native-material/core';
import { useCustomDataTypesContext } from '../../contexts/CustomDataContext';
import SelectDropdown from 'react-native-select-dropdown';
import { styles } from '../../style/styles';
/**
 *
 * @param {the field being rendered, and the current value from the parent} props
 * @returns either a dropdown or a text input for number values.
 */
const CustomDataPicker = props => {
    const [value, setValue] = React.useState(undefined);
    const field = props.field;
    const { customDataTypes } = useCustomDataTypesContext(); //grabs custom field info from DB
    let customData = customDataTypes.find(item => {
        return item.type == field.type;
    });

    useEffect(() => {
        if (props.value !== undefined) {
            setValue(props.value);
        }
    }, [props.value]);

    if (customData?.values === undefined) {
        //Not a dropdown, return text input with label for units
        return (
            <View key={field.name} style={styles.row}>
                <Text style={styles.fieldName}>
                    {field.name}: ({customData?.unit})
                </Text>
                <TextInput
                    value={`${value ?? ''}`}
                    keyboardType="decimal-pad"
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                    onChangeText={newText => {
                        setValue(newText)
                        props.updateForm(field, +newText);
                    }}
                    style={styles.fieldInput}
                    required={field.required}
                ></TextInput>
            </View>
        );
    } else {
        let items = [];
        customData?.values.forEach((element, index) => {
            let obj = {
                label: element,
                value: element,
                key: index,
            };
            items.push(obj);
        });

        return (
            <View style={styles.row}>
                <Text style={styles.fieldName}>{field.name}:</Text>
                <View>
                    <SelectDropdown
                        buttonStyle={styles.fieldInput}
                        defaultValue={value}
                        data={customData?.values}
                        onSelect={(selectedItem, index) => {
                            // console.log(selectedItem, index);
                            props.updateForm(field, selectedItem);
                        }}
                        rowTextForSelection={(item, index) => {
                            // text represented for each item in dropdown
                            // if data array is an array of objects then return item.property to represent item in dropdown
                            return item;
                        }}
                        keyExtractor={(item, index) => {
                            return item.key;
                        }}
                    />
                </View>
            </View>
        );
    }
};

export default CustomDataPicker;
