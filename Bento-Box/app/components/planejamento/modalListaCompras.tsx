import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

interface ModalListaComprasProps {
    visivel: boolean;
    lista: { nome: string; quantidadeAgrupada: string }[];
    itensNaDespensa: string[];
    fechar: () => void;
    adicionarParaDespensa: (nomeItem: string, quantidade: number) => void; 
}

export default function ModalListaCompras({ visivel, lista, itensNaDespensa, fechar, adicionarParaDespensa }: ModalListaComprasProps) {
    
    const [itemExpandido, setItemExpandido] = useState<string | null>(null);
    const [quantidadeTemp, setQuantidadeTemp] = useState<number>(1);

    const normalizeString = (str: string) => 
        str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

    const confirmarAdicao = (nomeItem: string) => {
        adicionarParaDespensa(nomeItem, quantidadeTemp);
        setItemExpandido(null);
        setQuantidadeTemp(1);
    };

    return (
        <Modal visible={visivel} transparent={true} animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <Text style={styles.titulo}>Lista de Compras 🛒</Text>
                    
                    <ScrollView>
                        {lista.length === 0 ? (
                            <Text style={styles.vazioText}>Nenhuma receita no planejamento!</Text>
                        ) : (
                            lista.map((item, index) => {
                                const nomeNormalizado = normalizeString(item.nome);
                                const possuiItem = itensNaDespensa?.includes(nomeNormalizado);
                                const isExpandido = itemExpandido === item.nome;

                                return (
                                    <View key={index} style={styles.itemWrapper}>
                                        <TouchableOpacity 
                                            style={styles.itemContainer}
                                            onPress={() => {
                                                if (possuiItem) {
                                                    Alert.alert("Já Cadastrado", `Você já possui '${item.nome}' na sua despensa.`);
                                                } else if (isExpandido) {
                                                    setItemExpandido(null);
                                                } else {
                                                    setItemExpandido(item.nome);
                                                    setQuantidadeTemp(1);
                                                }
                                            }}
                                        >
                                            <View style={[styles.bullet, { backgroundColor: possuiItem ? '#4CAF50' : '#FF6B6B' }]} />
                                            <View style={styles.textoContainer}>
                                                <Text style={[styles.itemNome, { textDecorationLine: possuiItem ? 'line-through' : 'none', color: possuiItem ? '#888' : '#000' }]}>
                                                    {item.nome}
                                                </Text>
                                                {item.quantidadeAgrupada ? (
                                                    <Text style={styles.itemQuantidade}>Qtd: {item.quantidadeAgrupada}</Text>
                                                ) : null}
                                            </View>
                                            
                                            {!possuiItem && !isExpandido && (
                                                <FontAwesome5 name="plus-circle" size={14} color="#aaa" style={styles.iconeExtra} />
                                            )}
                                        </TouchableOpacity>

                                        {isExpandido && (
                                            <View style={styles.acaoInlineContainer}>
                                                <Text style={styles.acaoLabel}>Adicionar à Despensa:</Text>
                                                
                                                <View style={styles.controleQtd}>
                                                    <TouchableOpacity 
                                                        style={styles.botaoAjusteQtd}
                                                        onPress={() => setQuantidadeTemp(prev => Math.max(1, prev - 1))}
                                                    >
                                                        <FontAwesome5 name="minus" size={12} color="#555" />
                                                    </TouchableOpacity>
                                                    
                                                    <Text style={styles.textoQuantidade}>{quantidadeTemp}</Text>
                                                    
                                                    <TouchableOpacity 
                                                        style={styles.botaoAjusteQtd}
                                                        onPress={() => setQuantidadeTemp(prev => prev + 1)}
                                                    >
                                                        <FontAwesome5 name="plus" size={12} color="#555" />
                                                    </TouchableOpacity>
                                                </View>

                                                <TouchableOpacity 
                                                    style={styles.botaoConfirmarEnvio}
                                                    onPress={() => confirmarAdicao(item.nome)}
                                                >
                                                    <FontAwesome5 name="check" size={14} color="#FFF" />
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                    </View>
                                );
                            })
                        )}
                    </ScrollView>

                    <TouchableOpacity 
                        style={styles.botaoFechar} 
                        onPress={() => {
                            setItemExpandido(null); 
                            fechar(); 
                        }}
                    >
                        <Text style={styles.txtBotao}>Fechar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    container: { backgroundColor: '#fff', width: '85%', maxHeight: '80%', padding: 20, borderRadius: 10 },
    titulo: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
    itemWrapper: { borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingVertical: 5 },
    itemContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
    textoContainer: { flex: 1 },
    bullet: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
    itemNome: { fontSize: 16, fontWeight: '500' },
    itemQuantidade: { fontSize: 14, color: '#666' },
    iconeExtra: { paddingHorizontal: 10 },
    
    /* Estilos do Inline Action */
    acaoInlineContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f9fa', padding: 8, borderRadius: 6, marginTop: 5, marginLeft: 18 },
    acaoLabel: { fontSize: 12, color: '#555', marginRight: 10 },
    controleQtd: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 4, marginRight: 10 },
    botaoAjusteQtd: { paddingHorizontal: 10, paddingVertical: 5 },
    textoQuantidade: { fontSize: 14, fontWeight: 'bold', width: 20, textAlign: 'center' },
    botaoConfirmarEnvio: { backgroundColor: '#4CAF50', padding: 8, borderRadius: 4 },
    
    botaoFechar: { backgroundColor: '#FF6B6B', padding: 12, borderRadius: 8, marginTop: 15 },
    txtBotao: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
    vazioText: { textAlign: 'center', color: '#666', marginVertical: 20 }
});