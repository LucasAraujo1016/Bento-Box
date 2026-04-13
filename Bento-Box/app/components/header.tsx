import React from 'react';
import { View, Image, Text, Pressable, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import style from '../styleSheet';

export default function HeaderCustomizado() {
  
  const handleLogout = () => {
    Alert.alert(
      "Sair",
      "Tem certeza que deseja sair de sua conta?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sair", 
          style: "destructive",
          onPress: async () => {
            // Limpa o AsyncStorage e manda o usuário de volta pro index/login
            await AsyncStorage.removeItem('usuarioId');
            await AsyncStorage.removeItem('usuarioNome');
            router.replace('/'); 
          }
        }
      ]
    );
  };

  return (
    <View style={style.header}>
      <Image
        source={require('../../assets/images/logo.png')}
        style={{width: 100, height: 90}}
        resizeMode="contain"
      />
      <Text style={{fontSize: 30}}>Bento-Box</Text>
      
      <Pressable onPress={handleLogout} style={style.btnLogout}>
        <MaterialIcons name="logout" size={24} color="red" />      
      </Pressable>
    </View>
  );
}