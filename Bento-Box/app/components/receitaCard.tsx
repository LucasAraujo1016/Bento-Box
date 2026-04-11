import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';

export interface ReceitaItem {
    id: string | undefined;
    _id?: string; // ID do MongoDB
    nome: string;
    imagem: string;
    descricao?: string;
    tempoPreparo?: number;
    nivelHabilidade: string;
    tipoCulinaria: string;
    restricoes: string[];
    ingredientes?: { nome: string; quantidade: string }[];
    modoPreparo?: string[];
}

interface Props {
    receita: ReceitaItem;
    onPress: (receita: ReceitaItem) => void;
}

export default function ReceitaCard({ receita, onPress }: Props) {
    // Se a receita não tiver imagem, colocamos um cinza temporário
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
        width: '48%', // Ocupa quase metade da tela (2 colunas)
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3, // Sombrinha no Android
        overflow: 'hidden', // Faz a imagem não vazar das bordas redondas
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
        height: 70, // Altura fixa para garantir que todos os cards fiquem do mesmo tamanho
        justifyContent: 'space-between', // Espalha o título para o topo e a tag para a base
    },
    titulo: {
        fontWeight: 'bold',
        fontSize: 14,
        color: '#333',
        height: 38, // Garante o espaço para 2 linhas, não afetando o layout se tiver apenas 1
    },
    tags: {
        fontSize: 10,
        color: '#666',
        textTransform: 'uppercase',
    }
});