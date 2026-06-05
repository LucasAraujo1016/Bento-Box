import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, Share, Platform } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import AntDesign from '@expo/vector-icons/AntDesign';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';

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

    const sanitizarNomeArquivo = (nome: string) =>
        nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9 ]/g, '').trim().replace(/\s+/g, '_');

    const confirmarAdicao = (nomeItem: string) => {
        adicionarParaDespensa(nomeItem, quantidadeTemp);
        setItemExpandido(null);
        setQuantidadeTemp(1);
    };

    const compartilharLista = async () => {
        try {
            if (lista.length === 0) {
                Alert.alert("Lista vazia", "Adicione receitas ao planejamento antes de compartilhar.");
                return;
            }

            const nomeUsuario = await AsyncStorage.getItem('usuarioNome') ?? 'Alguém';

            const itens = lista.map(item =>
                `• ${item.nome}${item.quantidadeAgrupada ? ` - ${item.quantidadeAgrupada}` : ''}`
            ).join('\n');

            const mensagem = `🛒 *${nomeUsuario}* convidou você a ajudá-lo em sua *Lista de Compras - Bento-Box*!\n\n${itens}`;

            await Share.share({
                message: mensagem,
                title: 'Lista de Compras',
            });
        } catch {
            Alert.alert("Erro", "Não foi possível compartilhar a lista.");
        }
    };

    const baixarListaPDF = async () => {
        try {
            if (lista.length === 0) {
                Alert.alert("Lista vazia", "Adicione receitas ao planejamento antes de baixar.");
                return;
            }

            const htmlContent = `
                <html>
                    <head>
                        <meta charset="utf-8">
                        <style>
                            body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
                            h1 { color: #FF9D4D; }
                            ul { padding-left: 20px; }
                            li { margin-bottom: 10px; font-size: 16px; line-height: 1.5; }
                            .riscado { text-decoration: line-through; color: #aaa; }
                            .quantidade { color: #888; font-size: 14px; }
                        </style>
                    </head>
                    <body>
                        <h1>🛒 Lista de Compras</h1>
                        <ul>
                            ${lista.map(item => {
                                const nomeNorm = item.nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
                                const possuiItem = itensNaDespensa?.includes(nomeNorm);
                                return `<li class="${possuiItem ? 'riscado' : ''}">
                                    ${item.nome}
                                    ${item.quantidadeAgrupada ? `<span class="quantidade"> - ${item.quantidadeAgrupada}</span>` : ''}
                                </li>`;
                            }).join('')}
                        </ul>
                    </body>
                </html>
            `;

            const { uri: tempUri } = await Print.printToFileAsync({
                html: htmlContent,
                base64: false,
            });

            const nomeArquivo = `${sanitizarNomeArquivo('Lista_de_Compras')}.pdf`;

            if (Platform.OS === 'android') {
                const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync(
                    FileSystem.StorageAccessFramework.getUriForDirectoryInRoot('Download')
                );

                if (!permissions.granted) {
                    Alert.alert("Permissão negada", "Não foi possível acessar a pasta de Downloads.");
                    return;
                }

                const base64 = await FileSystem.readAsStringAsync(tempUri, {
                    encoding: FileSystem.EncodingType.Base64,
                });

                const destUri = await FileSystem.StorageAccessFramework.createFileAsync(
                    permissions.directoryUri,
                    nomeArquivo,
                    'application/pdf'
                );

                await FileSystem.writeAsStringAsync(destUri, base64, {
                    encoding: FileSystem.EncodingType.Base64,
                });

                Alert.alert("Download concluído!", `A lista foi salva como "${nomeArquivo}" na pasta escolhida.`);
            } else {
                const destUri = `${FileSystem.documentDirectory}${nomeArquivo}`;
                await FileSystem.copyAsync({ from: tempUri, to: destUri });

                await Sharing.shareAsync(destUri, {
                    mimeType: 'application/pdf',
                    dialogTitle: 'Salvar Lista de Compras',
                    UTI: 'com.adobe.pdf',
                });
            }

            await FileSystem.deleteAsync(tempUri, { idempotent: true });

        } catch {
            Alert.alert("Erro", "Não foi possível salvar a lista.");
        }
    };

    return (
        <Modal visible={visivel} transparent={true} animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <Text style={styles.titulo}>Lista de Compras</Text>

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

                    <View style={styles.rodape}>
                        <TouchableOpacity style={styles.botaoAcao} onPress={compartilharLista}>
                            <AntDesign name="share-alt" size={18} color="#fff" />
                            <Text style={styles.txtBotaoAcao}>Compartilhar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.botaoAcao, { backgroundColor: '#FF9D4D' }]} onPress={baixarListaPDF}>
                            <AntDesign name="download" size={18} color="#fff" />
                            <Text style={styles.txtBotaoAcao}>Baixar PDF</Text>
                        </TouchableOpacity>
                    </View>

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
    acaoInlineContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f9fa', padding: 8, borderRadius: 6, marginTop: 5, marginLeft: 18 },
    acaoLabel: { fontSize: 12, color: '#555', marginRight: 10 },
    controleQtd: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 4, marginRight: 10 },
    botaoAjusteQtd: { paddingHorizontal: 10, paddingVertical: 5 },
    textoQuantidade: { fontSize: 14, fontWeight: 'bold', width: 20, textAlign: 'center' },
    botaoConfirmarEnvio: { backgroundColor: '#4CAF50', padding: 8, borderRadius: 4 },
    rodape: { flexDirection: 'row', gap: 10, marginTop: 15 },
    botaoAcao: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#007AFF', padding: 12, borderRadius: 8 },
    txtBotaoAcao: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
    botaoFechar: { backgroundColor: '#FF6B6B', padding: 12, borderRadius: 8, marginTop: 10 },
    txtBotao: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
    vazioText: { textAlign: 'center', color: '#666', marginVertical: 20 }
});