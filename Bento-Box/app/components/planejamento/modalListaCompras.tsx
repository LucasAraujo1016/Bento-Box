import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

interface ModalListaComprasProps {
    visivel: boolean;
    lista: { nome: string; quantidadeAgrupada: string }[];
    fechar: () => void;
}

export default function ModalListaCompras({ visivel, lista, fechar }: ModalListaComprasProps) {
    return (
        <Modal visible={visivel} transparent={true} animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <Text style={styles.titulo}>Lista de Compras 🛒</Text>
                    
                    <ScrollView>
                        {lista.length === 0 ? (
                            <Text style={styles.vazioText}>Nenhuma receita no planejamento!</Text>
                        ) : (
                            lista.map((item, index) => (
                                <View key={index} style={styles.itemContainer}>
                                    <View style={styles.bullet} />
                                    <View>
                                        <Text style={styles.itemNome}>{item.nome}</Text>
                                        {item.quantidadeAgrupada ? (
                                            <Text style={styles.itemQuantidade}>Qtd: {item.quantidadeAgrupada}</Text>
                                        ) : null}
                                    </View>
                                </View>
                            ))
                        )}
                    </ScrollView>

                    <TouchableOpacity style={styles.botaoFechar} onPress={fechar}>
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
    itemContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
    bullet: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF6B6B', marginRight: 10 },
    itemNome: { fontSize: 16, fontWeight: '500' },
    itemQuantidade: { fontSize: 14, color: '#666' },
    botaoFechar: { backgroundColor: '#FF6B6B', padding: 12, borderRadius: 8, marginTop: 15 },
    txtBotao: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
    vazioText: { textAlign: 'center', color: '#666', marginVertical: 20 }
});