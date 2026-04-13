import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';

export interface ReceitaItem {
    _id?: string;
    id?: string;
    autorId: string;
    autorNome?: string;
    nome: string;
    imagem?: string;
    descricao: string;
    tempoPreparo: number;
    nivelHabilidade: string;
    tipoCulinaria: string;
    restricoes?: string[];
    ingredientes?: { nome: string; quantidade: string }[];
    modoPreparo?: string[];
}

interface Props {
    receita: ReceitaItem;
    onPress: (receita: ReceitaItem) => void;
}

export default function ReceitaCard({ receita, onPress }: Props) {
    const temImagem = receita.imagem && receita.imagem !== '';

    return (
        <Pressable style={styles.card} onPress={() => onPress(receita)}>
            {temImagem ? (
                <Image source={{ uri: receita.imagem }} style={styles.imagem} />
            ) : (
                <View style={[styles.imagem, styles.placeholder]}>
                    <Text style={styles.textoPlaceholder}>Sem Imagem</Text>
                </View>
            )}
            
            <View style={styles.info}>
                <Text style={styles.titulo} numberOfLines={2}>{receita.nome}</Text>
                <Text style={styles.tags} numberOfLines={1}>{receita.tipoCulinaria}</Text>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
        overflow: 'hidden',
    },
    imagem: {
        width: '100%',
        height: 120,
        backgroundColor: '#eaeaea',
    },
    placeholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    textoPlaceholder: {
        color: '#a0a0a0',
        fontSize: 12,
    },
    info: {
        padding: 10,
        height: 70,
        justifyContent: 'space-between',
    },
    titulo: {
        fontWeight: 'bold',
        fontSize: 14,
        color: '#333',
        height: 38,
    },
    tags: {
        fontSize: 10,
        color: '#666',
        textTransform: 'uppercase',
    }
});