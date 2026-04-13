import React from 'react';
import { View, Text } from 'react-native';
import style from '../styleSheet';

interface Props {
    titulo: string;
    subtitulo: string;
}

export default function EstadoVazio({ titulo, subtitulo }: Props) {
    return (
        <View style={style.vazioContainer}>
            <Text style={style.vazioTexto}>{titulo}</Text>
            <Text style={style.vazioSubtexto}>{subtitulo}</Text>
        </View>
    );
}