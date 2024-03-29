import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { Button, Text } from '@react-native-material/core';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { styles } from '../../style/styles';

/**
 *
 * @param {visible, value} props
 * @returns a datepicker that saves the selected date as a Date Object, when rendering the selected value the date is converted to a localeString
 */
const DatePicker = props => {
    const [value, setValue] = useState(undefined);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(props.visible);
    }, [props.visible]);

    useEffect(() => {
        if (props.value !== undefined) {
            let date = new Date(props.value);
            setValue(date.toLocaleDateString());
        }
    }, [props.value]);

    let field = props.field;
    let showname = `show${field.key}`;
    return (
        <View key={field.name} style={styles.row}>
            <Text style={styles.fieldName}>
                {field.name}: {value}
            </Text>
            <Button
                color={'#C7E1FF'}
                title={`Select ${field.name}`}
                onPress={() => {
                    props.toggleShow(field, showname);
                }}
                style={styles.fieldInput}
            ></Button>
            <DateTimePickerModal
                isVisible={visible}
                mode="date"
                display="spinner"
                themeVariant="light" //important do not remove
                onConfirm={newDate => {
                    props.updateForm(field, showname, newDate);
                    setValue(newDate.toLocaleDateString());
                }}
                onCancel={() => {
                    //should hide the date picker.
                    props.toggleShow(field, showname);
                }}
                maximumDate={new Date(2100, 12, 30)}
            ></DateTimePickerModal>
        </View>
    );
};

export default DatePicker;
