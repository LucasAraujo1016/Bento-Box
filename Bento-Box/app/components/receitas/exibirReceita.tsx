import React, { Component } from 'react';
import { View, Text, Modal, Pressable, ScrollView, Image, StyleSheet, Share, Alert, Platform } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Entypo from '@expo/vector-icons/Entypo';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { ReceitaItem } from './receitaCard';

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

    compartilharReceita = async () => {
        try {
            const { receita } = this.props;
            if (!receita) return;

            const link = `bentobox://receita/${receita._id || receita.id}`;

            const mensagem = `😋 Dá uma olhada nessa receita de *${receita.nome}* que encontrei no Bento-Box!\n\n⏱️ Tempo: ${receita.tempoPreparo} min\n🍳 Dificuldade: ${receita.nivelHabilidade}\n\nAbra no aplicativo: ${link}`;

            await Share.share({
                message: mensagem,
                title: `Receita: ${receita.nome}`,
            });
        } catch {
            Alert.alert("Erro", "Não foi possível compartilhar a receita.");
        }
    };

    baixarReceitaPDF = async () => {
        try {
            const { receita } = this.props;
            if (!receita) return;

            const ingredientes = receita.ingredientes || [];
            const modoPreparo = receita.modoPreparo || [];

            const htmlContent = `
                <html>
                    <head>
                        <meta charset="utf-8">
                        <style>
                            body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
                            h1 { color: #FF9D4D; }
                            h2 { color: #555; margin-top: 20px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
                            li { margin-bottom: 8px; line-height: 1.5; }
                            .info { background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
                        </style>
                    </head>
                    <body>
                        <h1>${receita.nome}</h1>
                        <div class="info">
                            <p><strong>Tempo de preparo:</strong> ${receita.tempoPreparo} minutos</p>
                            <p><strong>Dificuldade:</strong> ${receita.nivelHabilidade}</p>
                            <p><strong>Tipo de Culinária:</strong> ${receita.tipoCulinaria}</p>
                            <p><em>${receita.descricao || ''}</em></p>
                        </div>
                        <h2>Ingredientes</h2>
                        <ul>
                            ${ingredientes.map((i: any) => `<li>${i.nome} ${i.quantidade ? `- ${i.quantidade}` : ''}</li>`).join('')}
                        </ul>
                        <h2>Modo de Preparo</h2>
                        <ol>
                            ${modoPreparo.map((m: string) => `<li>${m}</li>`).join('')}
                        </ol>
                    </body>
                </html>
            `;

            const { uri: tempUri } = await Print.printToFileAsync({
                html: htmlContent,
                base64: false,
            });

            const nomeArquivo = `${receita.nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9 ]/g, '').trim().replace(/\s+/g, '_')}.pdf`;

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

                Alert.alert("Download concluído!", `A receita foi salva como "${nomeArquivo}" na pasta escolhida.`);
            } else {
                const destUri = `${FileSystem.documentDirectory}${nomeArquivo}`;
                await FileSystem.copyAsync({ from: tempUri, to: destUri });

                await Sharing.shareAsync(destUri, {
                    mimeType: 'application/pdf',
                    dialogTitle: 'Salvar Receita',
                    UTI: 'com.adobe.pdf',
                });
            }

            await FileSystem.deleteAsync(tempUri, { idempotent: true });

        } catch {
            Alert.alert("Erro", "Não foi possível salvar a receita.");
        }
    };

    render() {
        const { visible, receita, onClose, isFavorito, isFeita, onToggleFavorito, onMarcarFeita } = this.props;

        if (!receita) return null;

        const temImagem = receita.imagem && receita.imagem !== '';

        const ingredientes = receita.ingredientes || [];
        const modoPreparo = receita.modoPreparo || [];

        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={visible}
                onRequestClose={onClose}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalCard}>

                        <View style={styles.header}>
                            <Pressable onPress={onClose} style={styles.btnClose}>
                                <AntDesign name="arrow-left" size={24} color="#333" />
                            </Pressable>
                            <View style={styles.actions}>
                                <Pressable onPress={this.compartilharReceita} style={styles.actionBtn}>
                                    <AntDesign name="share-alt" size={24} color="#007AFF" as any />
                                </Pressable>
                                <Pressable onPress={this.baixarReceitaPDF} style={styles.actionBtn}>
                                    <AntDesign name="download" size={24} color="#FF9D4D" />
                                </Pressable>
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

                                {receita.autorNome && (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, marginTop: -5 }}>
                                        <AntDesign name="user" size={14} color="#FF9D4D" style={{ marginRight: 5 }} />
                                        <Text style={{ fontSize: 14, color: '#FF9D4D', fontWeight: 'bold' }}>
                                            Por: {receita.autorNome}
                                        </Text>
                                    </View>
                                )}

                                <Text style={styles.descricao}>{receita.descricao || "Sem descrição disponível."}</Text>

                                <View style={styles.infoRow}>
                                    <View style={styles.infoBadge}>
                                        <Text style={styles.infoBadgeText}><AntDesign name="clock-circle" size={12} /> {receita.tempoPreparo || '?'} min</Text>
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
                                {ingredientes.length > 0 ? (
                                    ingredientes.map((ing: any, idx: number) => (
                                        <Text key={idx} style={styles.itemTexto}>• {ing.nome} {ing.quantidade ? `- ${ing.quantidade}` : ''}</Text>
                                    ))
                                ) : (
                                    <Text style={styles.itemTexto}>Nenhum ingrediente listado.</Text>
                                )}

                                <Text style={styles.secaoTitulo}>Modo de Preparo</Text>
                                {modoPreparo.length > 0 ? (
                                    modoPreparo.map((passo: string, idx: number) => (
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
    infoRow: { flexDirection: 'row', marginBottom: 5, flexWrap: 'wrap' },
    infoBadge: { backgroundColor: '#f0f0f0', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 10, marginBottom: 10 },
    infoBadgeText: { fontSize: 12, color: '#555', fontWeight: 'bold', textAlign: 'center' },
    tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
    tagWrapper: { backgroundColor: '#FFECE0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 8, marginBottom: 8 },
    tagText: { color: '#FF9D4D', fontSize: 12, fontWeight: 'bold', textAlign: 'center' },
    secaoTitulo: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 15, marginBottom: 10 },
    itemTexto: { fontSize: 15, color: '#444', marginBottom: 8, lineHeight: 22 }
});