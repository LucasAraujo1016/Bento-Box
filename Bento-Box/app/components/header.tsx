import React, { useState } from 'react';
import { View, Image, Text, Pressable, StyleSheet } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'; 
import style from '../styleSheet';
import ModalPerfil from './modalPerfil'; 

export default function HeaderCustomizado() {
  const [modalPerfilVisivel, setModalPerfilVisivel] = useState(false); 

  return (
    <View style={style.header}>
      
      {/* Esquerda: Apenas a Logo */}
      <Image
        source={require('../../assets/images/logo.png')}
        style={{ width: 100, height: 90, marginRight: 10 }}
        resizeMode="contain"
      />
      
      {/* Direita: Nome do app e botão de Perfil juntos */}
      <View style={styles.rightContainer}>
        <Text style={{ fontSize: 30, marginRight: 15 }}>Bento-Box</Text>
        
        <Pressable onPress={() => setModalPerfilVisivel(true)} style={styles.profileBtn}>
          <FontAwesome5 name="user-cog" size={20} color="#555" />
        </Pressable>
      </View>
      
      <ModalPerfil 
        visible={modalPerfilVisivel} 
        onClose={() => setModalPerfilVisivel(false)} 
      />

    </View>
  );
}

const styles = StyleSheet.create({
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  profileBtn: {
    backgroundColor: '#eee',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 }
  }
});