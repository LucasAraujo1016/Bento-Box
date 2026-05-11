import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

interface ModalPerfilProps {
    visible: boolean;
    onClose: () => void;
}

export default function ModalPerfil({ visible, onClose }: ModalPerfilProps) {
    const [carregando, setCarregando] = useState(false);
    const [usuarioId, setUsuarioId] = useState<string | null>(null);
    const [totalReceitasCriadas, setTotalReceitasCriadas] = useState(0); // Renomeei o state

    const [nome, setNome] = useState('');
    const [editandoNome, setEditandoNome] = useState(false);
    const [culinaria, setCulinaria] = useState('');
    const [editandoCulinaria, setEditandoCulinaria] = useState(false);
    const [habilidade, setHabilidade] = useState('');
    const [editandoHabilidade, setEditandoHabilidade] = useState(false);
    const [restricoesAtuais, setRestricoesAtuais] = useState<string[]>([]);
    const [editandoRestricoes, setEditandoRestricoes] = useState(false);

    const opcoesHabilidade = ['Iniciante', 'Intermediário', 'Profissional'];
    const opcoesCulinaria = ['Japonesa', 'Italiana', 'Brasileira', 'Mexicana'];
    const opcoesRestricoes = ['Vegetariano', 'Vegano', 'Intolerante a Lactose', 'Alérgico a Amendoim', 'Alérgico a frutos do mar', 'Sem Glúten'];

    useEffect(() => {
        if (visible) {
            carregarDados();
        } else {
            setEditandoNome(false);
            setEditandoCulinaria(false);
            setEditandoHabilidade(false);
            setEditandoRestricoes(false);
        }
    }, [visible]);

    const carregarDados = async () => {
        setCarregando(true);
        try {
            const uid = await AsyncStorage.getItem('usuarioId');
            if (!uid) return;
            setUsuarioId(uid);

            // Fetch dados do perfil
            const respostaPerfil = fetch(`http://localhost:3000/api/perfil/${uid}`);
            
            // Fetch contando quantas receitas este usuário (autorId) criou
            const respostaReceitasCount = fetch(`http://localhost:3000/api/receitas/autor/${uid}/count`);

            const [resPerfil, resCount] = await Promise.all([respostaPerfil, respostaReceitasCount]);

            if (resPerfil.ok) {
                const dados = await resPerfil.json();
                setNome(dados.nome_usuario || '');
                setHabilidade(dados.nivel_habilidade || '');
                setCulinaria(dados.culinaria_favorita || '');
                setRestricoesAtuais(dados.restricoes || []);
            }

            if (resCount.ok) {
                const dadosCount = await resCount.json();
                setTotalReceitasCriadas(dadosCount.total || 0); // Atualiza com contagem de CRIAÇÕES
            }

        } catch (error) {
            console.error(error);
        } finally {
            setCarregando(false);
        }
    };

    const salvarCampoUnico = async (novoCampo: any) => {
        if (!usuarioId) return;

        try {
            const resposta = await fetch(`http://localhost:3000/api/perfil/${usuarioId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nome_usuario: nome,
                    nivel_habilidade: habilidade,
                    culinaria_favorita: culinaria,
                    restricoes: restricoesAtuais,
                    ...novoCampo
                }),
            });

            if (!resposta.ok) throw new Error("Falha na API");
            
            if (novoCampo.hasOwnProperty('nome_usuario')) {
                await AsyncStorage.setItem('usuarioNome', novoCampo.nome_usuario); 
            }
        } catch {
            Alert.alert("Erro", "Erro ao sincronizar essa alteração com o servidor.");
        }
    };

    const handletoggleRestricaoTemp = (r: string) => {
        setRestricoesAtuais(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]);
    };

    const confirmRestricoes = () => {
        salvarCampoUnico({ restricoes: restricoesAtuais });
        setEditandoRestricoes(false);
    };

    const confirmHabilidade = (hSelecionada: string) => {
        setHabilidade(hSelecionada);
        salvarCampoUnico({ nivel_habilidade: hSelecionada });
        setEditandoHabilidade(false);
    };

    const confirmCulinaria = (cSelecionada: string) => {
        setCulinaria(cSelecionada);
        salvarCampoUnico({ culinaria_favorita: cSelecionada });
        setEditandoCulinaria(false);
    };

    const confirmNome = () => {
        if (nome.trim() === "") { Alert.alert("Nome Inválido"); return; }
        salvarCampoUnico({ nome_usuario: nome });
        setEditandoNome(false);
    };

    const handleLogout = () => {
        Alert.alert("Sair", "Tem certeza que deseja sair da conta?", [
            { text: "Cancelar", style: "cancel" },
            { 
                text: "Sair", 
                style: "destructive",
                onPress: async () => {
                    await AsyncStorage.removeItem('usuarioId');
                    await AsyncStorage.removeItem('usuarioNome');
                    onClose(); 
                    router.replace('/'); 
                }
            }
        ]);
    };

    // Navega e fecha o modal
    const navegarPara = (rota: any) => {
        onClose();
        router.push(rota);
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View style={styles.overlay}>
                <TouchableOpacity style={styles.backgroundClose} onPress={onClose} activeOpacity={1} />
                <View style={styles.drawerContainer}>
                    <View style={styles.drawerHeader}>
                        <Text style={styles.drawerTitle}>Meu Perfil</Text>
                        <TouchableOpacity onPress={onClose}>
                            <FontAwesome5 name="times" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>

                    {carregando ? (
                        <ActivityIndicator size="large" color="#FF9D4D" style={{ marginTop: 50 }} />
                    ) : (
                        <ScrollView contentContainerStyle={styles.drawerContent} showsVerticalScrollIndicator={false}>
                            
                            {/* --- ESTATÍSTICAS --- */}
                            <View style={styles.estatisticasCard}>
                                <FontAwesome5 name="book-open" size={24} color="#4A90E2" /> 
                                <View style={{ marginLeft: 15 }}>
                                    <Text style={styles.estatisticaValor}>{totalReceitasCriadas}</Text>
                                    <Text style={styles.estatisticaLabel}>Receitas Criadas</Text>
                                </View>
                            </View>

                            {/* --- CAMPO NOME --- */}
                            <Text style={styles.labelForm}>Nome</Text>
                            {!editandoNome ? (
                                <View style={styles.readOnlyContainer}>
                                    <Text style={styles.readOnlyText}>{nome || "Nenhum nome definido"}</Text>
                                    <TouchableOpacity style={styles.btnEditarPequeno} onPress={() => setEditandoNome(true)}>
                                        <FontAwesome5 name="pencil-alt" size={14} color="#666" />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View style={styles.editModeContainer}>
                                    <TextInput style={styles.inputInline} value={nome} onChangeText={setNome} />
                                    <View style={styles.botoesInline}>
                                        <TouchableOpacity style={styles.btnCancelarInline} onPress={() => { setEditandoNome(false); carregarDados(); }}>
                                            <FontAwesome5 name="times" size={14} color="#FFF" />
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.btnSalvarInline} onPress={confirmNome}>
                                            <FontAwesome5 name="check" size={14} color="#FFF" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}

                            {/* --- CAMPO CULINARIA --- */}
                            <Text style={styles.labelForm}>Culinária Favorita</Text>
                            {!editandoCulinaria ? (
                                <View style={styles.readOnlyContainer}>
                                    <Text style={[styles.readOnlyText, {textTransform: 'capitalize'}]}>{culinaria || "Nenhuma..."}</Text>
                                    <TouchableOpacity style={styles.btnEditarPequeno} onPress={() => setEditandoCulinaria(true)}>
                                        <FontAwesome5 name="pencil-alt" size={14} color="#666" />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View style={styles.editBox}>
                                    {opcoesCulinaria.map(opcao => (
                                        <TouchableOpacity key={opcao} style={styles.botaoOpcao} onPress={() => confirmCulinaria(opcao)}>
                                            <Text style={styles.textoOpcao}>{opcao}</Text>
                                        </TouchableOpacity>
                                    ))}
                                    <TouchableOpacity onPress={() => setEditandoCulinaria(false)} style={styles.btnCancelarLista}>
                                        <Text style={styles.textoCancelarLista}>Cancelar</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {/* --- CAMPO HABILIDADE --- */}
                            <Text style={styles.labelForm}>Nível de Habilidade</Text>
                            {!editandoHabilidade ? (
                                <View style={styles.readOnlyContainer}>
                                    <Text style={[styles.readOnlyText, {textTransform: 'capitalize'}]}>{habilidade || "Não definido"}</Text>
                                    <TouchableOpacity style={styles.btnEditarPequeno} onPress={() => setEditandoHabilidade(true)}>
                                        <FontAwesome5 name="pencil-alt" size={14} color="#666" />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View style={styles.editBox}>
                                    {opcoesHabilidade.map(opcao => (
                                        <TouchableOpacity key={opcao} style={styles.botaoOpcao} onPress={() => confirmHabilidade(opcao)}>
                                            <Text style={styles.textoOpcao}>{opcao}</Text>
                                        </TouchableOpacity>
                                    ))}
                                    <TouchableOpacity onPress={() => setEditandoHabilidade(false)} style={styles.btnCancelarLista}>
                                        <Text style={styles.textoCancelarLista}>Cancelar</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {/* --- CAMPO RESTRIÇÕES --- */}
                            <Text style={styles.labelForm}>Restrições Alimentares</Text>
                            {!editandoRestricoes ? (
                                <View style={styles.readOnlyContainer}>
                                    <Text style={styles.readOnlyText}>
                                        {restricoesAtuais.length > 0 ? restricoesAtuais.join(', ') : "Nenhuma Restrição"}
                                    </Text>
                                    <TouchableOpacity style={styles.btnEditarPequeno} onPress={() => setEditandoRestricoes(true)}>
                                        <FontAwesome5 name="pencil-alt" size={14} color="#666" />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View style={styles.editBox}>
                                    <View style={styles.opcoesContainer}>
                                        {opcoesRestricoes.map(restricao => {
                                            const ativo = restricoesAtuais.includes(restricao);
                                            return (
                                                <TouchableOpacity 
                                                    key={restricao} 
                                                    style={[styles.botaoOpcaoMini, ativo && styles.botaoOpcaoAtivo]}
                                                    onPress={() => handletoggleRestricaoTemp(restricao)}
                                                >
                                                    <Text style={[styles.textoOpcao, ativo && styles.textoOpcaoAtivo]}>{restricao}</Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                    
                                    <View style={{flexDirection:'row', marginTop: 15, justifyContent: 'flex-end', gap: 10}}>
                                        <TouchableOpacity style={styles.btnCancelarLista} onPress={() => { setEditandoRestricoes(false); carregarDados(); }}>
                                            <Text style={styles.textoCancelarLista}>Cancelar</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.btnSalvarLista} onPress={confirmRestricoes}>
                                            <Text style={styles.textoSalvarLista}>Salvar</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}

                            {/* --- NAVEGAÇÃO INTERNA DO PERFIL --- */}
                            <View style={styles.navMenu}>
                                <Text style={styles.labelForm}>Minhas Atividades</Text>
                                <TouchableOpacity style={styles.navItem} onPress={() => navegarPara('/favoritos')}>
                                    <View style={styles.navItemEsq}>
                                        <FontAwesome5 name="heart" size={18} color="#FF4D4D" solid />
                                        <Text style={styles.navItemText}>Receitas Favoritas</Text>
                                    </View>
                                    <FontAwesome5 name="chevron-right" size={14} color="#ccc" />
                                </TouchableOpacity>
                                
                                <TouchableOpacity style={styles.navItem} onPress={() => navegarPara('/historico')}>
                                    <View style={styles.navItemEsq}>
                                        <FontAwesome5 name="history" size={18} color="#4A90E2" />
                                        <Text style={styles.navItemText}>Histórico de Receitas</Text>
                                    </View>
                                    <FontAwesome5 name="chevron-right" size={14} color="#ccc" />
                                </TouchableOpacity>
                            </View>
                            
                            <View style={{ height: 40 }} /> 
                        </ScrollView>
                    )}

                    <View style={styles.drawerFooter}>
                        <TouchableOpacity style={styles.botaoSair} onPress={handleLogout}>
                            <FontAwesome5 name="sign-out-alt" size={16} color="#FFF" style={{marginRight: 10}} />
                            <Text style={styles.textoBotaoSair}>Sair da Conta</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    backgroundClose: { flex: 1 },
    drawerContainer: { width: '82%', maxWidth: 350, backgroundColor: '#fff', height: '100%', elevation: 15 }, 
    
    drawerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: '#fafafa' },
    drawerTitle: { fontSize: 20, fontWeight: 'bold' },
    drawerContent: { padding: 20 },

    estatisticasCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f8ff', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#cae6ff', marginBottom: 10 },
    estatisticaValor: { fontSize: 22, fontWeight: 'bold', color: '#333' },
    estatisticaLabel: { fontSize: 13, color: '#666', fontWeight: '500' },
    
    labelForm: { fontSize: 13, fontWeight: 'bold', color: '#888', marginTop: 20, marginBottom: 5, textTransform: 'uppercase' },
    
    readOnlyContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9f9f9', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#eee' },
    readOnlyText: { fontSize: 16, color: '#333', flex: 1, marginRight: 10, lineHeight: 22 },
    btnEditarPequeno: { padding: 5 },

    editModeContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    inputInline: { flex: 1, borderWidth: 1, borderColor: '#FF9D4D', borderRadius: 8, padding: 10, fontSize: 16, backgroundColor: '#fff' },
    botoesInline: { flexDirection: 'row', gap: 5 },
    btnSalvarInline: { backgroundColor: '#4CAF50', padding: 12, borderRadius: 8 },
    btnCancelarInline: { backgroundColor: '#FF6B6B', padding: 12, borderRadius: 8 },

    editBox: { backgroundColor: '#f5f5f5', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0' },
    btnCancelarLista: { alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 15 },
    textoCancelarLista: { color: '#FF6B6B', fontWeight: 'bold', fontSize: 14 },
    btnSalvarLista: { backgroundColor: '#4A90E2', paddingVertical: 8, paddingHorizontal: 20, borderRadius: 6 },
    textoSalvarLista: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },

    opcoesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    botaoOpcao: { width: '100%', borderWidth: 1, borderColor: '#ccc', borderRadius: 6, paddingVertical: 12, paddingHorizontal: 15, backgroundColor: '#fff', marginBottom: 8 },
    botaoOpcaoMini: { borderWidth: 1, borderColor: '#ccc', borderRadius: 15, paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#fff' },
    botaoOpcaoAtivo: { backgroundColor: '#FF9D4D', borderColor: '#FF9D4D' },
    textoOpcao: { color: '#555', fontWeight: '500', textAlign: 'center' },
    textoOpcaoAtivo: { color: '#fff', fontWeight: 'bold' },

    navMenu: { marginTop: 15, borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 10 },
    navItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f9f9f9' },
    navItemEsq: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    navItemText: { fontSize: 16, fontWeight: '500', color: '#444' },

    drawerFooter: { padding: 20, borderTopWidth: 1, borderTopColor: '#eee', backgroundColor: '#fafafa' },
    botaoSair: { flexDirection: 'row', backgroundColor: '#FF4D4D', padding: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    textoBotaoSair: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});