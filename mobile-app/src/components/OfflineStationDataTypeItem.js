import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { Button } from '@react-native-material/core';
import { AntDesign } from '@expo/vector-icons';

/**
 * 
 * @param {type} props 
 * @returns a list item that shows the field name and type, if custom it shows the options available. Has a switch to enable selection. 
 */
const OfflineStationDataTypeItem = (props) => {
  const field = props.item;
  const [showValues, setShowValues] = useState(false);
  const [value, setValue] = useState(false);
  const [type, setType] = useState(props.type);
  const [customData, setCustomData] = useState(props.customData);
  let options = [];
  if(type === 'custom') {
    // console.log('custom data', customData)
    if(customData?.values !== null) {
    options = customData?.values;
    }
    else {
      options = null;
    }
  }

  const handleIconPress = () => {
    setShowValues((prevState) => !prevState);
  };

  return (
    <View key={field._id} style={styles.item}>
      <View style={styles.row}>
        <View style={styles.rowDescription}>
          <Text style={styles.text}>Field: {field.name}</Text>
          <Text style={styles.text}>Type: {type === 'custom' ? 'custom' : `${field.type}`}</Text>
          {type == 'custom' && (
            <React.Fragment>
              {options !== null && (
                <View style={styles.optionIconWrapper} >
                <Text style={styles.text} onPress={handleIconPress}>
                  
                  Options:
                  </Text>
                  {showValues ? (
                    <AntDesign  style={styles.icon} name='rightcircleo' size={24} color='black' onPress={handleIconPress}/>
                  ) : (
                    <AntDesign style={styles.icon} name='downcircleo' size={24} color='black' onPress={handleIconPress}/>
                  )}
                </View>
                )}
            

            </React.Fragment>
          )}
        </View>
        <View>
          <Switch
            ios_backgroundColor={'grey'}
            onValueChange={(value) => {
              setValue((prevState) => !prevState);
              props.handleSelection(field, value);
            }}
            value={value}
          ></Switch>
        </View>
        {showValues && (
          <View style={styles.valuesWrapper}>
            {options.map((option, index) => {
              return (
                <View key={index} style={styles.optionLabelAndTextWrapper}>
                  <Text style={styles.optionLabel}>Option {index + 1}:</Text>
                  <Text style={styles.optiontext}>{option}</Text>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    flex: 1,
    backgroundColor: '#EDEDED',
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 10,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginRight: 30,
  },
  rowDescription: {
    marginLeft: 20,
    flex: 2,
  },
  text: {
    fontSize: 25,
    margin: 2,
    padding: 2,
  },
  valuesWrapper: {
    marginTop: 10,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    display: 'inline-block',
    width: '100%',
  },
  optionLabel: {
    fontSize: 20,
    marginLeft: 20,
  },
  optionLabelAndTextWrapper: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optiontext: {
    fontSize: 20,
    marginLeft: 20,
    marginRight: 20,
  },
  icon: {
    marginLeft: 20,
  },
  optionIconWrapper: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    justifyContent: 'flex-start',
  }
});

export default OfflineStationDataTypeItem;
