import React, { Component } from 'react';
import { View, ScrollView, Text, TouchableOpacity, TextInput, Alert, StyleSheet } from 'react-native';
import FooterCustomizado from './components/footer';
import HeaderCustomizado from './components/header';
import CabecalhoSecao from './components/cabecalhoSecao';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styleGeral from './styleSheet';
import ScannerCodigoBarras from './components/scanerCodigoBarras';
import { API_BASE_URL } from './constants/api';

interface DespensaState {
    usuarioId: string;
    itens: { _id: string; nomeItem: string; quantidade: number }[];
    novoItemTexto: string;
    novoItemQtd: number;
    textoBusca: string;
    scannerVisivel: boolean; // ← novo
}

export default class Despensa extends Component<any, DespensaState> {
    constructor(props: any) {
        super(props);
        this.state = {
            usuarioId: "",
            itens: [],
            novoItemTexto: "",
            novoItemQtd: 1,
            textoBusca: "",
            scannerVisivel: false, // ← novo
        };
    }

    async componentDidMount() {
        const uid = await AsyncStorage.getItem('usuarioId');
        if (uid) {
            this.setState({ usuarioId: uid }, () => this.carregarDespensa());
        } else {
            Alert.alert("Erro", "Usuário não logado.");
        }
    }

    carregarDespensa = async () => {
        try {
            const resp = await fetch(`${API_BASE_URL}/api/despensa/${this.state.usuarioId}`);
            if (resp.ok) {
                const dados = await resp.json();
                this.setState({ itens: dados });
            }
        } catch (error) {
            console.error(error);
        }
    }

    adicionarItem = async () => {
        const { usuarioId, novoItemTexto, novoItemQtd } = this.state;
        if (!novoItemTexto.trim()) return;

        try {
            const resp = await fetch(`${API_BASE_URL}/api/despensa`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuarioId, nomeItem: novoItemTexto, quantidade: novoItemQtd })
            });

            if (resp.ok) {
                const itemDeRetorno = await resp.json();

                this.setState(prevState => {
                    const indexExistente = prevState.itens.findIndex(i => i._id === itemDeRetorno._id);
                    let novosItens = [...prevState.itens];

                    if (indexExistente !== -1) {
                        novosItens[indexExistente] = itemDeRetorno;
                    } else {
                        novosItens.push(itemDeRetorno);
                    }

                    return {
                        itens: novosItens,
                        novoItemTexto: "",
                        novoItemQtd: 1
                    };
                });
            }
        } catch {
            Alert.alert("Erro", "Não foi possível adicionar o item.");
        }
    }

    // ─── Novo: chamado pelo scanner quando o produto é identificado ─────────────
    handleProdutoEscaneado = async (produto: {
        nomeCompleto: string;
        nomeGenerico: string;
        codigoBarras: string;
    }) => {
        const { usuarioId } = this.state;

        // Usa o nomeGenerico como nomeItem para que coincida com a lista de compras
        // (ex: diferentes marcas de manteiga → todas viram "Manteiga")
        const nomeParaDesepensa = produto.nomeGenerico;

        Alert.alert(
            'Produto identificado',
            `"${produto.nomeCompleto}" será adicionado à despensa como:\n\n🏷️ ${nomeParaDesepensa}\n\nContinuar?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Confirmar',
                    onPress: async () => {
                        try {
                            const resp = await fetch(`${API_BASE_URL}/api/despensa`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    usuarioId,
                                    nomeItem: nomeParaDesepensa,
                                    quantidade: 1,
                                }),
                            });

                            if (resp.ok) {
                                const itemDeRetorno = await resp.json();

                                this.setState(prevState => {
                                    const indexExistente = prevState.itens.findIndex(
                                        i => i._id === itemDeRetorno._id
                                    );
                                    const novosItens = [...prevState.itens];

                                    if (indexExistente !== -1) {
                                        novosItens[indexExistente] = itemDeRetorno;
                                        Alert.alert(
                                            '✓ Quantidade atualizada',
                                            `${nomeParaDesepensa}: ${itemDeRetorno.quantidade} unidade(s) na despensa`
                                        );
                                    } else {
                                        novosItens.push(itemDeRetorno);
                                        Alert.alert('✓ Adicionado', `${nomeParaDesepensa} foi adicionado à despensa!`);
                                    }

                                    return { itens: novosItens };
                                });
                            }
                        } catch {
                            Alert.alert('Erro', 'Não foi possível adicionar o item.');
                        }
                    },
                },
            ]
        );
    };
    // ────────────────────────────────────────────────────────────────────────────

    atualizarQuantidade = async (itemId: string, novaQtd: number) => {
        if (novaQtd < 0) return;

        try {
            const resp = await fetch(`${API_BASE_URL}/api/despensa/${itemId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantidade: novaQtd })
            });

            if (resp.ok) {
                this.setState(prevState => ({
                    itens: prevState.itens.map(i => i._id === itemId ? { ...i, quantidade: novaQtd } : i)
                }));
            }
        } catch {
            Alert.alert("Erro", "Falha ao atualizar quantidade do item.");
        }
    };

    removerItem = async (itemId: string, nome: string) => {
        Alert.alert("Remover", `Tirar '${nome}' da sua despensa?`, [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Remover",
                style: "destructive",
                onPress: async () => {
                    try {
                        const resp = await fetch(`${API_BASE_URL}/api/despensa/${itemId}`, { method: 'DELETE' });
                        if (resp.ok) {
                            this.setState(prevState => ({
                                itens: prevState.itens.filter(i => i._id !== itemId)
                            }));
                        }
                    } catch {
                        Alert.alert("Erro", "Falha ao remover item.");
                    }
                }
            }
        ]);
    }

    filtrarEOrdenarItens = () => {
        const { itens, textoBusca } = this.state;

        const normalizeString = (str: string) =>
            str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

        const buscaNormalizada = normalizeString(textoBusca);

        const itensFiltrados = itens.filter(item =>
            normalizeString(item.nomeItem).includes(buscaNormalizada)
        );

        return itensFiltrados.sort((a, b) =>
            normalizeString(a.nomeItem).localeCompare(normalizeString(b.nomeItem))
        );
    }

    render() {
        const itensRenderizados = this.filtrarEOrdenarItens();

        return (
            <View style={styleGeral.containerGeral}>
                <HeaderCustomizado />

                {/* ── Scanner (modal fullscreen) ── */}
                <ScannerCodigoBarras
                    visivel={this.state.scannerVisivel}
                    fechar={() => this.setState({ scannerVisivel: false })}
                    onProdutoIdentificado={this.handleProdutoEscaneado}
                />

                <ScrollView contentContainerStyle={styleGeral.scrollContent} stickyHeaderIndices={[1]}>
                    <CabecalhoSecao
                        titulo="Minha Despensa"
                        subtitulo="Controle os ingredientes que você tem em casa"
                        icone="box-open"
                        corIcone="#FF9D4D"
                    />

                    <View style={styles.topContainer}>
                        {/* ── Linha de adição manual + botão scanner ── */}
                        <View style={styles.inputContainer}>
                            <View style={styles.addQuantidadeContainer}>
                                <TouchableOpacity
                                    style={styles.botaoAjusteQtdBase}
                                    onPress={() => this.setState({ novoItemQtd: Math.max(0, this.state.novoItemQtd - 1) })}>
                                    <FontAwesome5 name="minus" size={12} color="#555" />
                                </TouchableOpacity>
                                <Text style={styles.textoQuantidade}>{this.state.novoItemQtd}</Text>
                                <TouchableOpacity
                                    style={styles.botaoAjusteQtdBase}
                                    onPress={() => this.setState({ novoItemQtd: this.state.novoItemQtd + 1 })}>
                                    <FontAwesome5 name="plus" size={12} color="#555" />
                                </TouchableOpacity>
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: Arroz; Feijão..."
                                value={this.state.novoItemTexto}
                                onChangeText={(text) => this.setState({ novoItemTexto: text })}
                                onSubmitEditing={this.adicionarItem}
                            />
                            <TouchableOpacity style={styles.botaoAdicionar} onPress={this.adicionarItem}>
                                <FontAwesome5 name="plus" size={16} color="#FFF" />
                            </TouchableOpacity>

                            {/* ── Botão scanner (novo) ── */}
                            <TouchableOpacity
                                style={styles.botaoScanner}
                                onPress={() => this.setState({ scannerVisivel: true })}
                            >
                                <FontAwesome5 name="barcode" size={18} color="#FFF" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.buscaContainer}>
                            <FontAwesome5 name="search" size={16} color="#888" style={styles.iconeBusca} />
                            <TextInput
                                style={styles.inputBusca}
                                placeholder="Pesquisar item..."
                                value={this.state.textoBusca}
                                onChangeText={(text) => this.setState({ textoBusca: text })}
                            />
                            {this.state.textoBusca !== "" && (
                                <TouchableOpacity onPress={() => this.setState({ textoBusca: "" })}>
                                    <FontAwesome5 name="times-circle" size={18} color="#888" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {this.state.itens.length === 0 ? (
                        <Text style={styles.vazioText}>Sua despensa está vazia no momento.</Text>
                    ) : itensRenderizados.length === 0 ? (
                        <Text style={styles.vazioText}>Nenhum item encontrado com esse nome.</Text>
                    ) : (
                        itensRenderizados.map(item => (
                            <View key={item._id} style={styles.itemRow}>
                                <Text style={styles.itemNome}>{item.nomeItem}</Text>

                                <View style={styles.controlesDireita}>
                                    <View style={styles.controleQuantidade}>
                                        <TouchableOpacity
                                            style={styles.botaoAjusteQtd}
                                            onPress={() => this.atualizarQuantidade(item._id, (item.quantidade ?? 1) - 1)}
                                        >
                                            <FontAwesome5 name="minus" size={12} color="#555" />
                                        </TouchableOpacity>

                                        <Text style={styles.textoAtual}>{item.quantidade ?? 1}</Text>

                                        <TouchableOpacity
                                            style={styles.botaoAjusteQtd}
                                            onPress={() => this.atualizarQuantidade(item._id, (item.quantidade ?? 1) + 1)}
                                        >
                                            <FontAwesome5 name="plus" size={12} color="#555" />
                                        </TouchableOpacity>
                                    </View>

                                    <TouchableOpacity
                                        style={styles.botaoDeletar}
                                        onPress={() => this.removerItem(item._id, item.nomeItem)}
                                    >
                                        <FontAwesome5 name="trash-alt" size={16} color="#FF6B6B" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    )}
                </ScrollView>

                <FooterCustomizado />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    topContainer: { backgroundColor: '#f9f9f9', paddingBottom: 10, zIndex: 10 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    buscaContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e9ecef', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 15 },
    iconeBusca: { marginRight: 10 },
    inputBusca: { flex: 1, fontSize: 16, color: '#333' },
    addQuantidadeContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 5, paddingVertical: 10, marginRight: 10 },
    botaoAjusteQtdBase: { padding: 5 },
    textoQuantidade: { marginHorizontal: 8, fontSize: 16, fontWeight: 'bold', width: 20, textAlign: 'center' },
    input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, backgroundColor: '#fff', fontSize: 16 },
    botaoAdicionar: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 8, marginLeft: 10, justifyContent: 'center', alignItems: 'center' },
    // ← novo
    botaoScanner: { backgroundColor: '#FF9D4D', padding: 15, borderRadius: 8, marginLeft: 8, justifyContent: 'center', alignItems: 'center' },
    itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, elevation: 1 },
    itemNome: { fontSize: 16, color: '#333', fontWeight: '500', flex: 1 },
    controlesDireita: { flexDirection: 'row', alignItems: 'center' },
    controleQuantidade: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 15, backgroundColor: '#f0f0f0', borderRadius: 20, paddingHorizontal: 5, paddingVertical: 3 },
    botaoAjusteQtd: { padding: 8 },
    textoAtual: { marginHorizontal: 10, fontSize: 14, fontWeight: 'bold', minWidth: 25, textAlign: 'center' },
    botaoDeletar: { padding: 8, marginLeft: 5 },
    vazioText: { textAlign: 'center', color: '#888', marginTop: 30, fontSize: 16 }
});