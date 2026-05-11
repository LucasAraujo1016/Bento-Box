import React from 'react';
import { View, Pressable} from 'react-native';
import style from '../styleSheet';
import { Link } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function FooterCustomizado() {
  return (
    <View style={style.footer}>
        <Link href="../home" asChild>
            <Pressable>
              <AntDesign name="home" size={35} color="black" />
            </Pressable>
        </Link>
        <Link href="../receitas" asChild>
            <Pressable>
              <Feather name="book-open" size={35} color="black" />
            </Pressable>
        </Link>
        <Link href="../planejamentoSemanal" asChild>
            <Pressable>
              <Entypo name="calendar" size={35} color="black" />
            </Pressable>
        </Link>
        <Link href="../despensa" asChild>
            <Pressable>
              <MaterialCommunityIcons name="fridge-outline" size={35} color="black" />
            </Pressable>
        </Link>
    </View>
  );
}