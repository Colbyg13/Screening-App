import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { Button, Text } from '@react-native-material/core';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { styles } from '../../style/styles';
const DatePicker = (props) => {
  const [value, setValue] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(props.visible);
  }, [props.visible]);

  let field = props.field;
  console.log('field inside datePicker', field);
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
      ></Button>
      <DateTimePickerModal
        isVisible={visible}
        mode='date'
        display='spinner'
        themeVariant='light' //important do not remove
        onConfirm={(newDate) => {
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
