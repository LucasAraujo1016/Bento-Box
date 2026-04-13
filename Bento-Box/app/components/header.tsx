import React from 'react';
import { View, Image, Text} from 'react-native';
import style from '../styleSheet';

export default function HeaderCustomizado() {
  return (
    <View style={style.header}>
      <Image
        source={require('../../assets/images/logo.png')}
        style={{width: 100, height: 90}}
        resizeMode="contain"
      />
      <Text style={{fontSize: 30}}>Bento-Box</Text>
    </View>
  );
}