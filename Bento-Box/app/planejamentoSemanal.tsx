import React, { Component, useEffect, useRef } from 'react'; // <-- Atualizado
import { useNavigation } from 'expo-router'; // <-- Novo
import { View, ScrollView, Text, Pressable, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import FooterCustomizado from './components/footer';
import HeaderCustomizado from './components/header';
import CabecalhoSecao from './components/cabecalhoSecao';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import style from './styleSheet';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

import ExibirReceita from './components/receitas/exibirReceita';
import { ReceitaItem } from './components/receitas/receitaCard';

interface PlanejamentoState {
    cardapio: { [key: string]: ReceitaItem[] };
    usuarioId: string;
    receitaSelecionada: ReceitaItem | null;
    modalExibirVisivel: boolean;
    idsFavoritos: string[];
    idsHistorico: string[];
    
    // Sugestões
    modalReceitasVisivel: boolean;
    sugestoes: ReceitaItem[];
    diaParaAdicionar: string | null;

    // Novos: Controle de banco de dados
    planosSalvos: any[];
    planoAtualId: string | null;
    nomePlanoAtual: string;
    modalSalvarVisivel: boolean;
    nomeTemporario: string;
    modalMeusPlanosVisivel: boolean;
    
    foiModificado: boolean; // NOVO: Controla se houve alterações
}

export default class PlanejamentoSemanal extends Component<any, PlanejamentoState> {
    
    diasDaSemana = [ 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo' ];

    constructor(props: any) {
        super(props);
        const cardapioInicial: { [key: string]: ReceitaItem[] } = {};
        this.diasDaSemana.forEach(d => cardapioInicial[d] = []);

        this.state = {
            cardapio: cardapioInicial, 
            usuarioId: "",
            receitaSelecionada: null,
            modalExibirVisivel: false,
            idsFavoritos: [],
            idsHistorico: [],
            modalReceitasVisivel: false,
            sugestoes: [],
            diaParaAdicionar: null,

            planosSalvos: [],
            planoAtualId: null,
            nomePlanoAtual: "Novo Planejamento*",
            modalSalvarVisivel: false,
            nomeTemporario: "",
            modalMeusPlanosVisivel: false,
            foiModificado: false // Inicializa como não modificado
        };
    }

    async componentDidMount() {
        const uid = await AsyncStorage.getItem('usuarioId');
        if (uid) {
            this.setState({ usuarioId: uid }, () => {
                this.buscarFavoritosDoBanco();
                this.buscarHistoricoDoBanco();
                this.carregarPlanosDoBanco();
            });
        }
    }

    // --- Integrações de Banco do Planejamento ---
    carregarPlanosDoBanco = async () => {
        try {
            const resp = await fetch(`http://localhost:3000/api/planejamento/lista?userId=${this.state.usuarioId}`);
            if (resp.ok) {
                const planos = await resp.json();
                this.setState({ planosSalvos: planos });
                
                // Abre o ultimo plano gerado (ou salvo) se não houver um aberto
                if (planos.length > 0 && !this.state.planoAtualId) {
                    const ultimoPlanoId = await AsyncStorage.getItem('ultimoPlanoId');
                    const planoAnterior = planos.find((p: any) => p._id === ultimoPlanoId);
                    
                    if (planoAnterior) {
                        this.selecionarPlanoCarregado(planoAnterior);
                    } else {
                        // Se não encontrou o id ou é a primeira vez, pega o primeiro da lista
                        this.selecionarPlanoCarregado(planos[0]);
                    }
                }
            }
        } catch (error) {
            console.error("Falha ao carregar lista de planos:", error);
        }
    }

    selecionarPlanoCarregado = async (plano: any) => {
        const cardapioCompleto: any = {};
        this.diasDaSemana.forEach(d => cardapioCompleto[d] = []);
        const cardapioIntegrado = { ...cardapioCompleto, ...plano.cardapio };

        await AsyncStorage.setItem('ultimoPlanoId', plano._id);

        this.setState({
            planoAtualId: plano._id,
            nomePlanoAtual: plano.nome,
            cardapio: cardapioIntegrado,
            modalMeusPlanosVisivel: false,
            foiModificado: false
        });
    }

    abrirModalSalvar = () => {
        this.setState({
            modalSalvarVisivel: true,
            // Tira o asterisco na hora de sugerir o nome pra salvar
            nomeTemporario: this.state.nomePlanoAtual.replace('*', '').trim() 
        });
    }

    clicarSalvarPlano = () => {
        const { planoAtualId } = this.state;
        if (planoAtualId) {
            // Se já for plano salvo, alerta o usuário sobre a confirmação da edição
            Alert.alert("Confirmar atualização", "Deseja confirmar as alterações neste planejamento?", [
                { text: "Cancelar", style: "cancel" },
                { text: "Confirmar", onPress: this.salvarPlanoConcluido }
            ]);
        } else {
            // Se for um novo, permite dar o nome primeiro
            this.abrirModalSalvar();
        }
    }

    salvarPlanoConcluido = async () => {
        const { planoAtualId, nomeTemporario, cardapio, usuarioId } = this.state;
        const isNovo = !planoAtualId;
        const url = isNovo ? `http://localhost:3000/api/planejamento` : `http://localhost:3000/api/planejamento/${planoAtualId}`;
        const method = isNovo ? 'POST' : 'PUT';

        try {
            const resp = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuarioId, nome: isNovo ? nomeTemporario : this.state.nomePlanoAtual, cardapio })
            });

            if (resp.ok) {
                const saved = await resp.json();
                await AsyncStorage.setItem('ultimoPlanoId', saved._id); // Memoriza o plano salvo
                this.setState({ 
                    planoAtualId: saved._id, 
                    nomePlanoAtual: saved.nome, 
                    modalSalvarVisivel: false,
                    foiModificado: false 
                });
                this.carregarPlanosDoBanco();
                Alert.alert("Sucesso", "Planejamento salvo com sucesso!");
            } else {
                const errData = await resp.json();
                Alert.alert("Aviso", errData.message || "Erro de validação do banco.");
            }
        } catch {
            Alert.alert("Erro", "Não foi possível salvar.");
        }
    }

    excluirPlanoRequisicao = (id: string, nome: string) => {
        Alert.alert("Excluir", `Tem certeza que deseja excluir '${nome}'?`, [
            { text: "Cancelar", style: "cancel" },
            { text: "Excluir", style: "destructive", onPress: async () => {
                try {
                    await fetch(`http://localhost:3000/api/planejamento/${id}`, { method: 'DELETE' });
                    
                    // Se estiver com este plano aberto, reseta o estado
                    if (this.state.planoAtualId === id) {
                        const vazio: any = {};
                        this.diasDaSemana.forEach(d => vazio[d] = []);
                        await AsyncStorage.removeItem('ultimoPlanoId'); // Esquece do plano deletado
                        this.setState({ planoAtualId: null, nomePlanoAtual: "Novo planejamento*", cardapio: vazio, foiModificado: false });
                    }
                    this.carregarPlanosDoBanco();
                } catch {
                    Alert.alert("Erro", "Falha ao excluir.");
                }
            }}
        ]);
    }

    // --- Outras Funções do Back ---
    buscarFavoritosDoBanco = async () => {
        try {
            const resposta = await fetch(`http://localhost:3000/api/favoritos/${this.state.usuarioId}`);
            if (resposta.ok) {
                const dados = await resposta.json();
                this.setState({ idsFavoritos: dados.map((i: any) => i._id || i.id) });
            }
        } catch {}
    }

    buscarHistoricoDoBanco = async () => {
        try {
            const resposta = await fetch(`http://localhost:3000/api/historico/${this.state.usuarioId}`);
            if (resposta.ok) {
                const dados = await resposta.json();
                this.setState({ idsHistorico: dados.map((i: any) => i._id || i.id) });
            }
        } catch {}
    }

    gerarCardapioInteligente = async () => {
        try {
            if (!this.state.usuarioId) return;
            const response = await fetch(`http://localhost:3000/api/planejamento/gerar?userId=${this.state.usuarioId}`);
            if (response.ok) {
                const cardapioGerado = await response.json();
                const novoCardapio = { ...this.state.cardapio, ...cardapioGerado };
                await AsyncStorage.removeItem('ultimoPlanoId'); // Esquece dele pois não está salvo ainda
                this.setState({ 
                    cardapio: novoCardapio, 
                    planoAtualId: null,
                    nomePlanoAtual: "Novo planejamento*",
                    foiModificado: true
                });
            }
        } catch {
            Alert.alert("Erro", "Falha ao gerar cardápio.");
        }
    }

    // Modal de Detalhes
    abrirReceitaDetalhes = (r: ReceitaItem) => this.setState({ receitaSelecionada: r, modalExibirVisivel: true });
    fecharModalExibir = () => this.setState({ modalExibirVisivel: false, receitaSelecionada: null });

    toggleFavorito = async (rec: ReceitaItem) => {
        const id = rec._id || rec.id;
        this.setState(p => ({ idsFavoritos: p.idsFavoritos.includes(id as string) ? p.idsFavoritos.filter(i => i !== id) : [...p.idsFavoritos, id as string] }));
        try { await fetch('http://localhost:3000/api/favoritos/toggle', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ usuarioId: this.state.usuarioId, receitaId: id }) }); } catch {}
    }

    marcarReceitaFeita = async (rec: ReceitaItem) => {
        const id = rec._id || rec.id;
        this.setState(p => ({ idsHistorico: p.idsHistorico.includes(id as string) ? p.idsHistorico.filter(i => i !== id) : [...p.idsHistorico, id as string] }));
        try { await fetch('http://localhost:3000/api/historico/toggle', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ usuarioId: this.state.usuarioId, receitaId: id }) }); } catch {}
    }

    // Funcionalidades da Tabela
    removerRefeicao = (dia: string, index: number) => {
        const novoCardapio = { ...this.state.cardapio };
        if (novoCardapio[dia]) {
            novoCardapio[dia].splice(index, 1);
            this.setState({ cardapio: novoCardapio, foiModificado: true }); // Ao remover o usuário mexeu no plano
        }
    }

    abrirModalAdicionar = async (dia: string) => {
        try {
            this.setState({ diaParaAdicionar: dia, modalReceitasVisivel: true, sugestoes: [] });
            const response = await fetch(`http://localhost:3000/api/planejamento/sugestoes?userId=${this.state.usuarioId}`);
            if (response.ok) this.setState({ sugestoes: await response.json() });
        } catch {
            Alert.alert("Erro", "Falha nas sugestões.");
        }
    }

    adicionarReceitaSelecionadaAoDia = (receita: ReceitaItem) => {
        const { diaParaAdicionar } = this.state;
        if (!diaParaAdicionar) return;
        const novoCardapio = { ...this.state.cardapio };
        novoCardapio[diaParaAdicionar].push(receita);
        this.setState({ cardapio: novoCardapio, modalReceitasVisivel: false, diaParaAdicionar: null, foiModificado: true }); // Ao adicionar o usuário mexeu no plano
    }

    render() {
        const { cardapio, receitaSelecionada, idsFavoritos, idsHistorico, sugestoes, diaParaAdicionar, planosSalvos, nomePlanoAtual, modalSalvarVisivel, nomeTemporario, modalMeusPlanosVisivel, planoAtualId, foiModificado } = this.state;
        
        let sugestoesFiltradas = sugestoes;
        if (diaParaAdicionar && cardapio[diaParaAdicionar]) {
            const idsPratosDoDia = cardapio[diaParaAdicionar].map(rec => rec.id || rec._id);
            sugestoesFiltradas = sugestoes.filter(rec => !idsPratosDoDia.includes(rec.id || rec._id));
        }

        return (
            <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}> 
                <HeaderCustomizado />

                <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20, paddingBottom: 10 }}>
                    
                    <CabecalhoSecao titulo="Planejamento Semanal" subtitulo="Suas refeições personalizadas da semana" icone="calendar-alt" corIcone="#FF9D4D" />

                    {/* BOTÕES DE MANIPULAÇÃO ABAIXO DO TÍTULO */}
                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                        <TouchableOpacity style={[style.botaoGerar, { flex: 1, marginBottom: 0 }]} onPress={this.gerarCardapioInteligente}>
                            {/* Usando o icone de calendário com o + */}
                            <FontAwesome5 name="calendar-plus" size={16} color="#FFF" style={{ marginRight: 10 }} />
                            <Text style={style.textoBotaoGerar}>Gerar planejamento</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={[style.botaoGerar, { backgroundColor: '#FF9D4D', paddingHorizontal: 20, marginBottom: 0 }]} onPress={() => this.setState({ modalMeusPlanosVisivel: true })}>
                            <FontAwesome5 name="folder-open" size={18} color="#FFF" />
                        </TouchableOpacity>
                    </View>

                    {/* EXIBIÇÃO DO NOME DO PLANO ATUAL */}
                    <View style={{ marginTop: 10, marginBottom: 20 }}>
                        <Text style={{ fontSize: 14, color: '#666', fontWeight: '500' }}>
                            Atual: <Text style={{ color: '#333', fontWeight: 'bold' }}>{nomePlanoAtual}</Text>
                        </Text>
                    </View>

                    {this.diasDaSemana.map((dia, index) => {
                        const refeicoesDoDia = cardapio[dia] || [];
                        return (
                            <View key={index} style={style.cardDia}>
                                <View style={style.topoCard}>
                                    <Text style={style.tituloDia}>{dia}</Text>
                                    <Pressable style={{ padding: 4 }} onPress={() => this.abrirModalAdicionar(dia)}>
                                        <FontAwesome5 name="plus-circle" size={20} color="#FF9D4D" solid />
                                    </Pressable>
                                </View>

                                {refeicoesDoDia.length > 0 ? (
                                    refeicoesDoDia.map((refeicao, refIndex) => (
                                        <TouchableOpacity key={refIndex} style={style.refeicaoItem} onPress={() => this.abrirReceitaDetalhes(refeicao)}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={style.nomeRefeicao}>{refeicao.nome}</Text>
                                                {refeicao.tempoPreparo && <Text style={{fontSize: 12, color: "#888", marginTop: 4}}><FontAwesome5 name="clock" /> {refeicao.tempoPreparo} min</Text>}
                                            </View>
                                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                                <Pressable onPress={(e) => { e.stopPropagation(); this.removerRefeicao(dia, refIndex); }}>
                                                    <FontAwesome5 name="trash" size={16} color="#FF5252" />
                                                </Pressable>
                                            </View>
                                        </TouchableOpacity>
                                    ))
                                ) : (
                                    <View style={style.estadoVazioPlanejamento}>
                                        <FontAwesome5 name="utensils" size={24} color="#ccc" style={{ marginBottom: 8 }} />
                                        <Text style={{ color: '#999', fontSize: 14, textAlign: 'center' }}>Nenhuma refeição planejada.</Text>
                                    </View>
                                )}
                            </View>
                        );
                    })}

                    {/* BOTÃO DE SALVAR NO RODAPÉ DA TELA */}
                    <TouchableOpacity 
                        style={[style.botaoGerar, { 
                            backgroundColor: (planoAtualId && !foiModificado) ? '#ccc' : '#4A90E2', 
                            marginTop: 20 
                        }]} 
                        onPress={this.clicarSalvarPlano}
                        disabled={!!planoAtualId && !foiModificado} // Desativa se for um plano cadastrado sem mudanças
                    >
                        <FontAwesome5 name="save" size={16} color="#FFF" style={{ marginRight: 10 }} />
                        <Text style={style.textoBotaoGerar}>Salvar Planejamento</Text>
                    </TouchableOpacity>
                </ScrollView>

                {/* MODAL: SALVAR DIÁLOGO (RENOMEAR) */}
                <Modal visible={modalSalvarVisivel} animationType="slide" transparent={true}>
                    <View style={style.modalContainer}>
                        <View style={style.modalCard}>
                            <Text style={style.modalTitulo}>Salvar Planejamento</Text>
                            <Text style={style.label}>Nome do Planejamento:</Text>
                            <TextInput 
                                style={style.modalInput} 
                                value={nomeTemporario}
                                onChangeText={t => this.setState({ nomeTemporario: t })}
                                placeholder="Digite um título..."
                            />
                            <View style={style.modalBotoes}>
                                <TouchableOpacity style={[style.modalBotao, style.modalBotaoCancelar]} onPress={() => this.setState({ modalSalvarVisivel: false })}>
                                    <Text style={style.modalTextoBotao}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[style.modalBotao, style.modalBotaoSalvar]} onPress={this.salvarPlanoConcluido}>
                                    <Text style={style.modalTextoBotao}>Salvar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* MODAL: MEUS PLANEJAMENTOS SALVOS (LISTA DO BANCO) */}
                <Modal visible={modalMeusPlanosVisivel} animationType="slide" transparent={true}>
                    <View style={style.modalContainer}>
                        <View style={[style.modalCard, { height: '80%' }]}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                                <Text style={style.modalTitulo}>Meus Planejamentos</Text>
                                <Pressable onPress={() => this.setState({ modalMeusPlanosVisivel: false })}>
                                    <FontAwesome5 name="times" size={24} color="#333" />
                                </Pressable>
                            </View>
                            <ScrollView>
                                {planosSalvos.map((plano) => (
                                    <TouchableOpacity 
                                        key={plano._id} 
                                        style={[style.refeicaoItem, {marginVertical: 6}]}
                                        onPress={() => this.selecionarPlanoCarregado(plano)}
                                    >
                                        <View style={{ flex: 1 }}>
                                            <Text style={style.nomeRefeicao}>{plano.nome}</Text>
                                            <Text style={{ fontSize: 12, color: '#999', marginTop: 4 }}>Ativo/Criado em: {new Date(plano.atualizacaoDts).toLocaleDateString('pt-BR')}</Text>
                                        </View>
                                        <Pressable style={{ padding: 10 }} onPress={(e) => { e.stopPropagation(); this.excluirPlanoRequisicao(plano._id, plano.nome); }}>
                                            <FontAwesome5 name="trash" size={18} color="#FF5252" />
                                        </Pressable>
                                    </TouchableOpacity>
                                ))}
                                {planosSalvos.length === 0 && (
                                    <Text style={{textAlign: 'center', color: '#888', marginTop: 20}}>Nenhum planejamento salvo.</Text>
                                )}
                            </ScrollView>
                        </View>
                    </View>
                </Modal>

                {/* MODAL: EXIBIR LISTA DE RECEITAS APRA ADICIONAR */}
                <Modal visible={this.state.modalReceitasVisivel} animationType="fade" transparent={true}>
                    <View style={style.modalContainer}>
                        <View style={[style.modalCard, { height: '80%' }]}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                                <Text style={style.modalTitulo}>Opções para: {diaParaAdicionar}</Text>
                                <Pressable onPress={() => this.setState({ modalReceitasVisivel: false })}>
                                    <FontAwesome5 name="times" size={24} color="#333" />
                                </Pressable>
                            </View>
                            <ScrollView>
                                {sugestoesFiltradas.map((rec, i) => (
                                    <TouchableOpacity key={i} style={[style.refeicaoItem, {marginVertical: 5}]} onPress={() => this.adicionarReceitaSelecionadaAoDia(rec)}>
                                        <Text style={style.nomeRefeicao}>{rec.nome}</Text>
                                        <FontAwesome5 name="plus" color="#4A90E2" size={14}/>
                                    </TouchableOpacity>
                                ))}
                                {sugestoesFiltradas.length === 0 && sugestoes.length > 0 && <Text style={{textAlign: 'center', color: '#888', marginTop: 20}}>Você já adicionou todas as receitas disponíveis para seu perfil neste dia!</Text>}
                                {sugestoes.length === 0 && <Text style={{textAlign: 'center', color: '#888', marginTop: 20}}>Buscando receitas...</Text>}
                            </ScrollView>
                        </View>
                    </View>
                </Modal>

                {/* MODAL: EXIBIR DETALHES DA RECEITA */}
                {receitaSelecionada && (
                    <ExibirReceita
                        visible={this.state.modalExibirVisivel}
                        receita={receitaSelecionada}
                        onClose={this.fecharModalExibir}
                        onToggleFavorito={this.toggleFavorito}
                        onMarcarFeita={this.marcarReceitaFeita}
                        isFavorito={idsFavoritos.includes((receitaSelecionada._id || receitaSelecionada.id) as string)}
                        isFeita={idsHistorico.includes((receitaSelecionada._id || receitaSelecionada.id) as string)}
                    />
                )}

                <FooterCustomizado />
            </View>
        );
    }
}