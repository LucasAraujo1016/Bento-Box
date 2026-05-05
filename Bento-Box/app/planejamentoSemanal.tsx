import React, { Component } from 'react';
import { View, ScrollView, Text, Pressable, TouchableOpacity, Alert, Modal } from 'react-native';
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
    modalReceitasVisivel: boolean;
    sugestoes: ReceitaItem[];
    diaParaAdicionar: string | null;
}

export default class PlanejamentoSemanal extends Component<any, PlanejamentoState> {
    
    diasDaSemana = [
        'Segunda-feira', 'Terça-feira', 'Quarta-feira', 
        'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'
    ];

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
            diaParaAdicionar: null
        };
    }

    async componentDidMount() {
        const uid = await AsyncStorage.getItem('usuarioId');
        if (uid) {
            this.setState({ usuarioId: uid }, () => {
                this.buscarFavoritosDoBanco();
                this.buscarHistoricoDoBanco();
            });
        }
    }

    buscarFavoritosDoBanco = async () => {
        try {
            const resposta = await fetch(`http://localhost:3000/api/favoritos/${this.state.usuarioId}`);
            if (resposta.ok) {
                const dados = await resposta.json();
                const ids = dados.map((item: any) => item._id || item.id).filter((id: any) => id !== undefined);
                this.setState({ idsFavoritos: ids });
            }
        } catch (error) {
            console.error("Erro ao buscar favoritos:", error);
        }
    }

    buscarHistoricoDoBanco = async () => {
        try {
            const resposta = await fetch(`http://localhost:3000/api/historico/${this.state.usuarioId}`);
            if (resposta.ok) {
                const dados = await resposta.json();
                const ids = dados.map((item: any) => item._id || item.id).filter((id: any) => id !== undefined);
                this.setState({ idsHistorico: ids });
            }
        } catch (error) {
            console.error("Erro de conexão ao buscar histórico:", error);
        }
    }

    gerarCardapioInteligente = async () => {
        try {
            if (!this.state.usuarioId) {
                alert("Você precisa estar logado para gerar o cardápio.");
                return;
            }
            
            const response = await fetch(`http://localhost:3000/api/planejamento/gerar?userId=${this.state.usuarioId}`);
            if (!response.ok) {
                throw new Error("Erro ao buscar cardápio da API");
            }
            
            const cardapioGerado = await response.json();
            
            const novoCardapio = { ...this.state.cardapio, ...cardapioGerado };
            this.setState({ cardapio: novoCardapio });
            
        } catch (error) {
            console.error(error);
            alert("A Api retornou erro e o cardápio não pôde ser gerado.");
        }
    }

    abrirReceitaDetalhes = (receita: ReceitaItem) => this.setState({ receitaSelecionada: receita, modalExibirVisivel: true });
    fecharModalExibir = () => this.setState({ modalExibirVisivel: false, receitaSelecionada: null });

    toggleFavorito = async (receita: ReceitaItem) => {
        const id = receita._id || receita.id;
        if (!id) return;
        this.setState(prev => {
            const jaFv = prev.idsFavoritos.includes(id);
            return { idsFavoritos: jaFv ? prev.idsFavoritos.filter(item => item !== id) : [...prev.idsFavoritos, id] };
        });
        try { await fetch('http://localhost:3000/api/favoritos/toggle', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ usuarioId: this.state.usuarioId, receitaId: id }) }); } catch { Alert.alert("Erro", "Falha"); }
    }

    marcarReceitaFeita = async (receita: ReceitaItem) => {
        const id = receita._id || receita.id;
        if (!id) return;
        this.setState(prev => {
            const jaF = prev.idsHistorico.includes(id);
            return { idsHistorico: jaF ? prev.idsHistorico.filter(item => item !== id) : [...prev.idsHistorico, id] };
        });
        try { await fetch('http://localhost:3000/api/historico/toggle', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ usuarioId: this.state.usuarioId, receitaId: id }) }); } catch { Alert.alert("Erro", "Falha"); }
    }

    removerRefeicao = (dia: string, indexRefeicao: number) => {
        const novoCardapio = { ...this.state.cardapio };
        
        if (novoCardapio[dia]) {
            novoCardapio[dia].splice(indexRefeicao, 1);
            this.setState({ cardapio: novoCardapio });
        }
    }

    abrirModalAdicionar = async (dia: string) => {
        try {
            this.setState({ diaParaAdicionar: dia, modalReceitasVisivel: true, sugestoes: [] });
            
            const response = await fetch(`http://localhost:3000/api/planejamento/sugestoes?userId=${this.state.usuarioId}`);
            
            if (response.ok) {
                const receitasCompativeis = await response.json();
                this.setState({ sugestoes: receitasCompativeis });
            } else {
                throw new Error();
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Erro", "Falha ao carregar as opções de receitas das sugestões.");
        }
    }

    adicionarReceitaSelecionadaAoDia = (receita: ReceitaItem) => {
        const { diaParaAdicionar } = this.state;
        if (!diaParaAdicionar) return;

        const novoCardapio = { ...this.state.cardapio };
        novoCardapio[diaParaAdicionar].push(receita);
        
        this.setState({ 
            cardapio: novoCardapio,
            modalReceitasVisivel: false,
            diaParaAdicionar: null
        });
    }

    render() {
        const { cardapio, receitaSelecionada, idsFavoritos, idsHistorico, modalReceitasVisivel, sugestoes, diaParaAdicionar } = this.state;
        
        let sugestoesFiltradas = sugestoes;
        
        if (diaParaAdicionar && cardapio[diaParaAdicionar]) {
            const idsPratosDoDia = cardapio[diaParaAdicionar].map(rec => rec.id || rec._id);
            sugestoesFiltradas = sugestoes.filter(rec => !idsPratosDoDia.includes(rec.id || rec._id));
        }

        return (
            <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}> 
                <HeaderCustomizado />

                <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20, paddingBottom: 100 }}>
                    
                    <CabecalhoSecao 
                        titulo="Planejamento Semanal" 
                        subtitulo="Sugestões baseadas no seu perfil e restrições" 
                        icone="calendar-alt" 
                        corIcone="#FF9D4D"
                    />

                    <TouchableOpacity style={style.botaoGerar} onPress={this.gerarCardapioInteligente}>
                        <FontAwesome5 name="magic" size={16} color="#FFF" style={{ marginRight: 10 }} />
                        <Text style={style.textoBotaoGerar}>Gerar Cardápio Inteligente</Text>
                    </TouchableOpacity>

                    {this.diasDaSemana.map((dia, index) => {
                        const refeicoesDoDia = cardapio[dia] || [];

                        return (
                            <View key={index} style={style.cardDia}>
                                <View style={style.topoCard}>
                                    <Text style={style.tituloDia}>{dia}</Text>
                                    
                                    <Pressable 
                                        style={{ padding: 4 }} 
                                        onPress={() => this.abrirModalAdicionar(dia)}
                                    >
                                        <FontAwesome5 name="plus-circle" size={20} color="#FF9D4D" solid />
                                    </Pressable>
                                </View>

                                {refeicoesDoDia.length > 0 ? (
                                    refeicoesDoDia.map((refeicao, refIndex) => (
                                        <TouchableOpacity 
                                            key={refIndex} 
                                            style={style.refeicaoItem}
                                            onPress={() => this.abrirReceitaDetalhes(refeicao)}
                                        >
                                            <View style={{ flex: 1 }}>
                                                <Text style={style.nomeRefeicao}>{refeicao.nome}</Text>
                                                {refeicao.tempoPreparo && (
                                                    <Text style={{fontSize: 12, color: "#888", marginTop: 4}}>
                                                        <FontAwesome5 name="clock" /> {refeicao.tempoPreparo} min
                                                    </Text>
                                                )}
                                            </View>
                                            
                                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                                <Pressable 
                                                    onPress={(e) => {
                                                        e.stopPropagation(); 
                                                        this.removerRefeicao(dia, refIndex);
                                                    }}>
                                                    <FontAwesome5 name="trash" size={16} color="#FF5252" />
                                                </Pressable>
                                            </View>
                                        </TouchableOpacity>
                                    ))
                                ) : (
                                    <View style={style.estadoVazioPlanejamento}>
                                        <FontAwesome5 name="utensils" size={24} color="#ccc" style={{ marginBottom: 8 }} />
                                        <Text style={{ color: '#999', fontSize: 14, textAlign: 'center' }}>
                                            Nenhuma refeição planejada. Pressione o botão acima ou no  +  para adicionar.
                                        </Text>
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </ScrollView>

                <Modal visible={modalReceitasVisivel} animationType="fade" transparent={true}>
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
                                    <TouchableOpacity 
                                        key={i} 
                                        style={[style.refeicaoItem, {marginVertical: 5}]}
                                        onPress={() => this.adicionarReceitaSelecionadaAoDia(rec)}
                                    >
                                        <Text style={style.nomeRefeicao}>{rec.nome}</Text>
                                        <FontAwesome5 name="plus" color="#4A90E2" size={14}/>
                                    </TouchableOpacity>
                                ))}
                                
                                {sugestoesFiltradas.length === 0 && sugestoes.length > 0 && (
                                    <Text style={{textAlign: 'center', color: '#888', marginTop: 20}}>
                                        Você já adicionou todas as receitas disponíveis para seu perfil neste dia!
                                    </Text>
                                )}
                                
                                {sugestoes.length === 0 && (
                                    <Text style={{textAlign: 'center', color: '#888', marginTop: 20}}>
                                        Buscando receitas compatíveis com o seu perfil...
                                    </Text>
                                )}
                            </ScrollView>
                        </View>
                    </View>
                </Modal>

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