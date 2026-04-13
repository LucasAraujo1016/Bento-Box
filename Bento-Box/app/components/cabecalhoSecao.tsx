import React from 'react';
import { View, Text } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import style from '../styleSheet';

interface Props {
    titulo: string;
    subtitulo: string;
    icone: string;
    corIcone?: string;
}

export default function CabecalhoSecao({ titulo, subtitulo, icone, corIcone = "#333" }: Props) {
    return (
        <View style={style.secaoHeaderWrapper}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                <FontAwesome5 name={icone} size={22} color={corIcone} style={{ marginRight: 10 }} solid />
                <Text style={style.tituloSecao}>{titulo}</Text>
            </View>
            <Text style={style.subtituloSecao}>{subtitulo}</Text>
        </View>
    );
}