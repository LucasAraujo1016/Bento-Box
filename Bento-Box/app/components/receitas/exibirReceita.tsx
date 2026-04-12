// app/components/exibirReceita.tsx
import React, { Component } from 'react';
import { View, Text, Modal, Pressable, ScrollView, Image, StyleSheet } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { ReceitaItem } from './receitaCard';
import Entypo from '@expo/vector-icons/Entypo';

interface Props {
    visible: boolean;
    receita: ReceitaItem | null;
    isFavorito: boolean;
    isFeita: boolean;
    onClose: () => void;
    onToggleFavorito: (receita: ReceitaItem) => void;
    onMarcarFeita: (receita: ReceitaItem) => void;
}

export default class ExibirReceita extends Component<Props> {
    render() {
        const { visible, receita, onClose, isFavorito, isFeita, onToggleFavorito, onMarcarFeita } = this.props;

        if (!receita) return null;

        const temImagem = receita.imagem && receita.imagem !== '';

        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={visible}
                onRequestClose={onClose}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalCard}>
                        
                        {/* Header com Botão Fechar e Ações */}
                        <View style={styles.header}>
                            <Pressable onPress={onClose} style={styles.btnClose}>
                                <AntDesign name="arrow-left" size={24} color="#333" />
                            </Pressable>
                            <View style={styles.actions}>
                                <Pressable onPress={() => onMarcarFeita(receita)} style={styles.actionBtn}>
                                    <FontAwesome5 name="check-circle" size={24} color={isFeita ? "#4CAF50" : "#ccc"} solid={isFeita} />
                                </Pressable>
                                <Pressable onPress={() => onToggleFavorito(receita)} style={styles.actionBtn}>
                                    <Entypo name={isFavorito ? "heart" : "heart-outlined"} size={24} color={isFavorito ? "#E53935" : "#ccc"} />
                                </Pressable>
                            </View>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                            {temImagem ? (
                                <Image source={{ uri: receita.imagem }} style={styles.imagem} />
                            ) : (
                                <View style={[styles.imagem, styles.placeholder]}>
                                    <Text style={styles.textoPlaceholder}>Sem Imagem</Text>
                                </View>
                            )}

                            <View style={styles.conteudo}>
                                <Text style={styles.titulo}>{receita.nome}</Text>
                                
                                {/* ===== NOVO BLOCO ADICIONADO ===== */}
                                {receita.autorNome && (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, marginTop: -5 }}>
                                        <AntDesign name="user" size={14} color="#FF9D4D" style={{ marginRight: 5 }} />
                                        <Text style={{ fontSize: 14, color: '#FF9D4D', fontWeight: 'bold' }}>
                                            Por: {receita.autorNome}
                                        </Text>
                                    </View>
                                )}
                                {/* ================================= */}

                                <Text style={styles.descricao}>{receita.descricao || "Sem descrição disponível."}</Text>

                                <View style={styles.infoRow}>
                                    <View style={styles.infoBadge}>
                                        <Text style={styles.infoBadgeText}><AntDesign name="clock-circle" size={12}/> {receita.tempoPreparo || '?'} min</Text>
                                    </View>
                                    <View style={styles.infoBadge}>
                                        <Text style={styles.infoBadgeText}>{receita.nivelHabilidade}</Text>
                                    </View>
                                    <View style={styles.infoBadge}>
                                        <Text style={styles.infoBadgeText}>{receita.tipoCulinaria}</Text>
                                    </View>
                                </View>

                                {receita.restricoes && receita.restricoes.length > 0 && (
                                    <View style={styles.tagsContainer}>
                                        {receita.restricoes.map((restricao, idx) => (
                                            <View key={idx} style={styles.tagWrapper}>
                                                <Text style={styles.tagText}>{restricao}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}

                                <Text style={styles.secaoTitulo}>Ingredientes</Text>
                                {receita.ingredientes && receita.ingredientes.length > 0 ? (
                                    receita.ingredientes.map((ing, idx) => (
                                        <Text key={idx} style={styles.itemTexto}>• {ing.nome} {ing.quantidade ? `- ${ing.quantidade}` : ''}</Text>
                                    ))
                                ) : (
                                    <Text style={styles.itemTexto}>Nenhum ingrediente listado.</Text>
                                )}

                                <Text style={styles.secaoTitulo}>Modo de Preparo</Text>
                                {receita.modoPreparo && receita.modoPreparo.length > 0 ? (
                                    receita.modoPreparo.map((passo, idx) => (
                                        <Text key={idx} style={styles.itemTexto}>{idx + 1}. {passo}</Text>
                                    ))
                                ) : (
                                    <Text style={styles.itemTexto}>Nenhum passo listado.</Text>
                                )}
                            </View>
                        </ScrollView>

                    </View>
                </View>
            </Modal>
        );
    }
}

const styles = StyleSheet.create({
    modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, height: '90%', overflow: 'hidden' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
    btnClose: { padding: 5 },
    actions: { flexDirection: 'row', gap: 15 },
    actionBtn: { padding: 5 },
    imagem: { width: '100%', height: 200, backgroundColor: '#eaeaea' },
    placeholder: { justifyContent: 'center', alignItems: 'center' },
    textoPlaceholder: { color: '#a0a0a0' },
    conteudo: { padding: 20 },
    titulo: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 10 },
    descricao: { fontSize: 14, color: '#666', marginBottom: 15, lineHeight: 20 },
    infoRow: { 
        flexDirection: 'row', 
        marginBottom: 5, 
        flexWrap: 'wrap' 
    },
    infoBadge: { 
        backgroundColor: '#f0f0f0', 
        paddingHorizontal: 12, 
        paddingVertical: 8, 
        borderRadius: 20, 
        justifyContent: 'center', 
        alignItems: 'center',
        marginRight: 10,
        marginBottom: 10 
    },
    infoBadgeText: { 
        fontSize: 12, 
        color: '#555', 
        fontWeight: 'bold',
        textAlign: 'center'
    },
    tagsContainer: { 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        marginBottom: 10 
    },
    tagWrapper: { 
        backgroundColor: '#FFECE0', 
        paddingHorizontal: 12, 
        paddingVertical: 6, 
        borderRadius: 15, 
        justifyContent: 'center', 
        alignItems: 'center',
        marginRight: 8,
        marginBottom: 8 
    },
    tagText: { 
        color: '#FF9D4D', 
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    secaoTitulo: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 15, marginBottom: 10 },
    itemTexto: { fontSize: 15, color: '#444', marginBottom: 8, lineHeight: 22 }
});