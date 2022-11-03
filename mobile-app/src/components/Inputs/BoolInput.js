import React, {useState, useEffect} from 'react'
import { Text, View, Switch } from 'react-native'
import { styles } from '../../style/styles';

const BoolInput = (props) => {
  const field = props.field
  console.log('field inside bool input', field);
  const [value, setValue] = useState(false)
  useEffect(() => {
    setValue(props.value)
  }, [props.value])
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
            ></Switch>
          </View>
        </View>
  )
}

export default BoolInput