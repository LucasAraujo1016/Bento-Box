import React, { Component } from 'react';
import { View, ScrollView, Text, TouchableOpacity, Alert } from 'react-native';
import FooterCustomizado from './components/footer';
import HeaderCustomizado from './components/header';
import CabecalhoSecao from './components/cabecalhoSecao';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import style from './styleSheet';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

import ExibirReceita from './components/receitas/exibirReceita';
import { ReceitaItem } from './components/receitas/receitaCard';
import CardDia from './components/planejamento/cardDia';
import ModalSalvarPlano from './components/planejamento/modalSalvarPlano';
import ModalMeusPlanos from './components/planejamento/modalMeusPlanos';
import ModalOpcoesDia from './components/planejamento/modalOpcoesDia';
import ModalListaCompras from './components/planejamento/modalListaCompras';

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
    planosSalvos: any[];
    planoAtualId: string | null;
    nomePlanoAtual: string;
    modalSalvarVisivel: boolean;
    nomeTemporario: string;
    modalMeusPlanosVisivel: boolean;
    foiModificado: boolean; 
    modalListaVisivel: boolean;
    listaCompras: any[];
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
            foiModificado: false, 
            modalListaVisivel: false,
            listaCompras: []
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

    carregarPlanosDoBanco = async () => {
        try {
            const resp = await fetch(`http://localhost:3000/api/planejamento/lista?userId=${this.state.usuarioId}`);
            if (resp.ok) {
                const planos = await resp.json();
                this.setState({ planosSalvos: planos });
                
                if (planos.length > 0 && !this.state.planoAtualId) {
                    const ultimoPlanoId = await AsyncStorage.getItem('ultimoPlanoId');
                    const planoAnterior = planos.find((p: any) => p._id === ultimoPlanoId);
                    
                    if (planoAnterior) {
                        this.selecionarPlanoCarregado(planoAnterior);
                    } else {
                        this.selecionarPlanoCarregado(planos[0]);
                    }
                }
            }
        } catch (error) {
            console.error(error);
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
            nomeTemporario: this.state.nomePlanoAtual.replace('*', '').trim() 
        });
    }

    clicarSalvarPlano = () => {
        const { planoAtualId } = this.state;
        if (planoAtualId) {
            Alert.alert("Confirmar atualização", "Deseja confirmar as alterações neste planejamento?", [
                { text: "Cancelar", style: "cancel" },
                { text: "Confirmar", onPress: this.salvarPlanoConcluido }
            ]);
        } else {
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
                await AsyncStorage.setItem('ultimoPlanoId', saved._id); 
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
                    
                    if (this.state.planoAtualId === id) {
                        const vazio: any = {};
                        this.diasDaSemana.forEach(d => vazio[d] = []);
                        await AsyncStorage.removeItem('ultimoPlanoId'); 
                        this.setState({ planoAtualId: null, nomePlanoAtual: "Novo planejamento*", cardapio: vazio, foiModificado: false });
                    }
                    this.carregarPlanosDoBanco();
                } catch {
                    Alert.alert("Erro", "Falha ao excluir.");
                }
            }}
        ]);
    }

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
                await AsyncStorage.removeItem('ultimoPlanoId'); 
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

    removerRefeicao = (dia: string, index: number) => {
        const novoCardapio = { ...this.state.cardapio };
        
        if (novoCardapio[dia]) {
            const refeicoesDoDia = [...novoCardapio[dia]];
            refeicoesDoDia.splice(index, 1);
            novoCardapio[dia] = refeicoesDoDia;
            this.setState({ cardapio: novoCardapio, foiModificado: true }); 
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
        
        novoCardapio[diaParaAdicionar] = [...novoCardapio[diaParaAdicionar], receita];
        
        this.setState({ 
            cardapio: novoCardapio, 
            modalReceitasVisivel: false, 
            diaParaAdicionar: null, 
            foiModificado: true 
        }); 
    }

    gerarListaDeCompras = () => {
        const { cardapio } = this.state;
        const listaAgrupada: Record<string, string[]> = {};

        Object.keys(cardapio).forEach(dia => {
            cardapio[dia].forEach(receita => {
                if (receita.ingredientes) {
                    receita.ingredientes.forEach(ingrediente => {
                        const nome = ingrediente.nome.trim();
                        // Trata caso a quantidade venha vazia
                        const quantidade = ingrediente.quantidade ? ingrediente.quantidade.toString().trim() : '';

                        if (listaAgrupada[nome]) {
                            listaAgrupada[nome].push(quantidade);
                        } else {
                            listaAgrupada[nome] = [quantidade];
                        }
                    });
                }
            });
        });

        const somarQuantidades = (quantidades: string[]) => {
            const totaisPorUnidade: Record<string, number> = {};

            quantidades.forEach(q => {
                if (!q) return;

                const qLower = q.toLowerCase();
                if (qLower.includes('colher') || qLower.includes('xícara') || qLower.includes('xicara')) {
                    return;
                }
                
                const match = q.match(/^([\d.,]+)\s*(.*)$/);
                
                if (match) {
                    const valor = parseFloat(match[1].replace(',', '.'));
                    
                    if (!isNaN(valor)) {
                        const unidade = match[2].trim().toLowerCase();
                        totaisPorUnidade[unidade] = (totaisPorUnidade[unidade] || 0) + valor;
                    }
                }
            });

            const partesSomadas = Object.keys(totaisPorUnidade).map(unidade => {
                const totalArredondadoParaCima = Math.ceil(totaisPorUnidade[unidade]);
                const totalFormatado = totalArredondadoParaCima.toString();
                
                const espaco = (unidade === 'g' || unidade === 'kg' || unidade === 'ml' || unidade === 'l') ? '' : ' ';
                
                return unidade ? `${totalFormatado}${espaco}${unidade}` : totalFormatado;
            });

            return partesSomadas.join(' + ');
        };

        const listaFinal = Object.keys(listaAgrupada).map(nomeIngrediente => {
            const quantidades = listaAgrupada[nomeIngrediente];
            const quantidadeAgrupada = somarQuantidades(quantidades);
            return { nome: nomeIngrediente, quantidadeAgrupada };
        });

        return listaFinal.sort((a, b) => a.nome.localeCompare(b.nome));
    }

    abrirListaDeCompras = () => {
        const novaLista = this.gerarListaDeCompras();
        this.setState({ listaCompras: novaLista, modalListaVisivel: true });
    }

    render() {
        const { 
            cardapio, receitaSelecionada, idsFavoritos, idsHistorico, 
            sugestoes, diaParaAdicionar, planosSalvos, nomePlanoAtual, 
            modalSalvarVisivel, nomeTemporario, modalMeusPlanosVisivel, 
            planoAtualId, foiModificado
            
        } = this.state;
        
        let sugestoesFiltradas = sugestoes;
        if (diaParaAdicionar && cardapio[diaParaAdicionar]) {
            const idsPratosDoDia = cardapio[diaParaAdicionar].map(rec => rec.id || rec._id);
            sugestoesFiltradas = sugestoes.filter(rec => !idsPratosDoDia.includes(rec.id || rec._id));
        }

        return (
            <View style={style.containerGeral}> 
                <HeaderCustomizado />

                <ScrollView contentContainerStyle={style.scrollContent}>
                    
                    <CabecalhoSecao titulo="Planejamento Semanal" subtitulo="Suas refeições personalizadas da semana" icone="calendar-alt" corIcone="#FF9D4D" />

                    <View style={style.botoesAcaoWrapper}>
                        <TouchableOpacity style={[style.botaoGerar, style.botaoGerarFlex]} onPress={this.gerarCardapioInteligente}>
                            <FontAwesome5 name="calendar-plus" size={16} color="#FFF" style={style.iconeMarginRight} />
                            <Text style={style.textoBotaoGerar}>Gerar planejamento</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={[style.botaoGerar, style.botaoMeusPlanos]} onPress={() => this.setState({ modalMeusPlanosVisivel: true })}>
                            <FontAwesome5 name="folder-open" size={18} color="#FFF" />
                        </TouchableOpacity>
                    </View>

                    <View style={style.atualTextoWrapper}>
                        <Text style={style.atualTexto}>
                            Atual: <Text style={style.atualTextoDestaque}>{nomePlanoAtual}</Text>
                        </Text>
                    </View>

                    {this.diasDaSemana.map((dia, index) => (
                        <CardDia 
                            key={index}
                            dia={dia}
                            refeicoesDoDia={cardapio[dia] || []}
                            onAbrirAdicionar={this.abrirModalAdicionar}
                            onAbrirDetalhes={this.abrirReceitaDetalhes}
                            onRemover={this.removerRefeicao}
                        />
                    ))}

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, marginBottom: 20 }}>
                        <TouchableOpacity 
                            style={[style.botaoGerar, { 
                                flex: 1, 
                                backgroundColor: (planoAtualId && !foiModificado) ? '#ccc' : '#4A90E2',
                                marginRight: 5 
                            }]} 
                            onPress={this.clicarSalvarPlano}
                            disabled={!!planoAtualId && !foiModificado}
                        >
                            <FontAwesome5 name="save" size={16} color="#FFF" style={style.iconeMarginRight} />
                            <Text style={style.textoBotaoGerar}>Salvar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[style.botaoGerar, { 
                                flex: 1, 
                                backgroundColor: '#4CAF50',
                                marginLeft: 5
                            }]} 
                            onPress={this.abrirListaDeCompras}
                        >
                            <FontAwesome5 name="shopping-cart" size={16} color="#FFF" style={style.iconeMarginRight} />
                            <Text style={style.textoBotaoGerar}>Lista</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>

                <ModalSalvarPlano 
                    visible={modalSalvarVisivel}
                    nomeTemporario={nomeTemporario}
                    onNomeChange={t => this.setState({ nomeTemporario: t })}
                    onCancelar={() => this.setState({ modalSalvarVisivel: false })}
                    onSalvar={this.salvarPlanoConcluido}
                />

                <ModalMeusPlanos 
                    visible={modalMeusPlanosVisivel}
                    planosSalvos={planosSalvos}
                    onClose={() => this.setState({ modalMeusPlanosVisivel: false })}
                    onSelecionarPlano={this.selecionarPlanoCarregado}
                    onExcluirPlano={this.excluirPlanoRequisicao}
                />

                <ModalOpcoesDia 
                    visible={this.state.modalReceitasVisivel}
                    diaParaAdicionar={diaParaAdicionar}
                    sugestoesFiltradas={sugestoesFiltradas}
                    temSugestoesTotais={sugestoes.length > 0}
                    buscandoSugestoes={sugestoes.length === 0}
                    onClose={() => this.setState({ modalReceitasVisivel: false })}
                    onAdicionarReceita={this.adicionarReceitaSelecionadaAoDia}
                />

                <ModalListaCompras 
                    visivel={this.state.modalListaVisivel} 
                    lista={this.state.listaCompras}
                    fechar={() => this.setState({ modalListaVisivel: false })}
                />

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