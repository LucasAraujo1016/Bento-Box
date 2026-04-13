import { Component } from "react";
import { View, ScrollView, Text, Pressable, Alert } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage'; 

import HeaderCustomizado from "./components/header";
import FooterCustomizado from "./components/footer";
import NovaReceita from "./components/receitas/novaReceita"; 
import FiltrosReceita from "./components/receitas/filtrosReceita";
import AntDesign from '@expo/vector-icons/AntDesign';
import style from "./styleSheet";
import ReceitaCard, { ReceitaItem } from "./components/receitas/receitaCard";
import ExibirReceita from "./components/receitas/exibirReceita";

interface State {
    modalVisivel: boolean;
    termoPesquisa: string;
    filtrosVisiveis: boolean;
    filtroHabilidade: string[];
    filtroCulinaria: string[];
    filtroRestricoes: string[];
    receitaSelecionada: ReceitaItem | null;
    modalExibirVisivel: boolean;
    idsFavoritos: string[];
    idsHistorico: string[];
    receitasOriginais: ReceitaItem[];
    receitasEmbaralhadas: ReceitaItem[];
    usuarioId: string;
    usuarioNome: string;
}

export default class Receitas extends Component<any, State> {
    state: State = {
        modalVisivel: false,
        termoPesquisa: '',
        filtrosVisiveis: false,
        filtroHabilidade: [],
        filtroCulinaria: [],
        filtroRestricoes: [],
        receitaSelecionada: null,
        modalExibirVisivel: false,
        idsFavoritos: [],
        idsHistorico: [],
        receitasOriginais: [],
        receitasEmbaralhadas: [],
        usuarioId: "",
        usuarioNome: "",
    };

    async componentDidMount() {
        const uid = await AsyncStorage.getItem('usuarioId');
        const nome = await AsyncStorage.getItem('usuarioNome') || "Chefe Anônimo";
        
        if (uid) {
            this.setState({ usuarioId: uid, usuarioNome: nome }, () => {
                this.buscarReceitasDoBanco();
                this.buscarHistoricoDoBanco(); 
                this.buscarFavoritosDoBanco();
            });
        } else {
            Alert.alert("Erro", "Sessão expirada. Faça login novamente.");
        }
    }

    buscarReceitasDoBanco = async () => {
        try {
            const resposta = await fetch('http://localhost:3000/api/receitas');
            if (resposta.ok) {
                const dadosBanco = await resposta.json();
                this.setState({ receitasOriginais: dadosBanco }, () => {
                    this.embaralharReceitas();
                });
            }
        } catch (error) {
            console.error("Erro de conexão ao buscar receitas:", error);
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

    embaralharReceitas = () => {
        const copiadas = [...this.state.receitasOriginais];
        const embaralhadas = copiadas.sort(() => Math.random() - 0.5);
        this.setState({ receitasEmbaralhadas: embaralhadas });
    }

    abrirModal = () => this.setState({ modalVisivel: true });
    fecharModal = () => {
        this.setState({ modalVisivel: false });
        this.buscarReceitasDoBanco(); 
    };
    
    toggleFiltros = () => this.setState(prev => ({ filtrosVisiveis: !prev.filtrosVisiveis }));

    toggleItemLista = (listaAlvo: 'filtroHabilidade' | 'filtroCulinaria' | 'filtroRestricoes', item: string) => {
        const listaAtual = this.state[listaAlvo];
        if (listaAtual.includes(item)) {
            this.setState({ [listaAlvo]: listaAtual.filter(val => val !== item) } as any);
        } else {
            this.setState({ [listaAlvo]: [...listaAtual, item] } as any);
        }
    };

    limparFiltros = () => {
        this.setState({
            filtroHabilidade: [],
            filtroCulinaria: [],
            filtroRestricoes: []
        });
    }

    obterReceitasFiltradas = () => {
        const { receitasEmbaralhadas, termoPesquisa, filtroHabilidade, filtroCulinaria, filtroRestricoes } = this.state;
        let resultado = receitasEmbaralhadas;

        if (termoPesquisa.trim() !== '') {
            const termo = termoPesquisa.toLowerCase();
            resultado = resultado.filter(receita => receita.nome.toLowerCase().includes(termo));
        }

        if (filtroHabilidade.length > 0) {
            const valoresHabilidade = filtroHabilidade.map(f => f === "Intermediário" ? "intermediario" : f.toLowerCase());
            resultado = resultado.filter(receita => receita.nivelHabilidade && valoresHabilidade.includes(receita.nivelHabilidade.toLowerCase()));
        }
        
        if (filtroCulinaria.length > 0) {
            const valoresCulinaria = filtroCulinaria.map(f => f.toLowerCase());
            resultado = resultado.filter(receita => receita.tipoCulinaria && valoresCulinaria.includes(receita.tipoCulinaria.toLowerCase()));
        }

        if (filtroRestricoes.length > 0) {
            resultado = resultado.filter(receita => {
                const restricoesReceita = receita.restricoes || [];
                return filtroRestricoes.every(restricaoSelecionada => restricoesReceita.includes(restricaoSelecionada));
            });
        }

        return resultado;
    }

    abrirReceitaDetalhes = (receita: ReceitaItem) => {
        this.setState({ receitaSelecionada: receita, modalExibirVisivel: true });
    }

    fecharModalExibir = () => {
        this.setState({ modalExibirVisivel: false, receitaSelecionada: null });
    }

    toggleFavorito = async (receita: ReceitaItem) => {
        const id = receita._id || receita.id;
        if (!id) return;

        this.setState(prev => {
            const jaFavorito = prev.idsFavoritos.includes(id);
            if (jaFavorito) {
                return { idsFavoritos: prev.idsFavoritos.filter(item => item !== id) };
            } else {
                return { idsFavoritos: [...prev.idsFavoritos, id] };
            }
        });

        try {
            await fetch('http://localhost:3000/api/favoritos/toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    usuarioId: this.state.usuarioId,
                    receitaId: id
                })
            });
        } catch {
            Alert.alert("Erro", "Falha ao registrar favorito.");
        }
    }

    marcarReceitaFeita = async (receita: ReceitaItem) => {
        const id = receita._id || receita.id;
        if (!id) return;

        this.setState(prev => {
            const jaFeita = prev.idsHistorico.includes(id);
            if (jaFeita) {
                return { idsHistorico: prev.idsHistorico.filter(item => item !== id) };
            } else {
                return { idsHistorico: [...prev.idsHistorico, id] };
            }
        });

        try {
            await fetch('http://localhost:3000/api/historico/toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    usuarioId: this.state.usuarioId, 
                    receitaId: id 
                })
            });
        } catch (error) {
            console.error("Erro ao salvar no histórico", error);
        }
    }

    render() {
        const listaExibicao = this.obterReceitasFiltradas();

        return (
            <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}> 
                <HeaderCustomizado />
                
                <FiltrosReceita 
                    termoPesquisa={this.state.termoPesquisa}
                    onChangeTermoPesquisa={(t: string) => this.setState({ termoPesquisa: t })}
                    filtrosVisiveis={this.state.filtrosVisiveis}
                    onToggleFiltros={this.toggleFiltros}
                    filtroHabilidade={this.state.filtroHabilidade}
                    filtroCulinaria={this.state.filtroCulinaria}
                    filtroRestricoes={this.state.filtroRestricoes}
                    onToggleItemLista={this.toggleItemLista}
                    onLimparFiltros={this.limparFiltros}
                />
                
                <ScrollView contentContainerStyle={{flexGrow: 1, padding: 20}}>
                    <Pressable style={[style.nova_receita, {marginBottom: 20, backgroundColor: '#FF9D4D', alignSelf: 'center'}]} onPress={this.abrirModal}>
                        <AntDesign name="plus-circle" size={24} color="white" />                           
                        <Text style={{fontSize: 16, fontWeight: 'bold', color: 'white', marginLeft: 8}}>Criar Nova Receita</Text>
                    </Pressable>

                    <View style={{flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%'}}>
                        {listaExibicao.map((receita) => (
                            <ReceitaCard 
                                key={receita._id || receita.id || Math.random().toString()} 
                                receita={receita} 
                                onPress={this.abrirReceitaDetalhes} 
                            />
                        ))}

                        {listaExibicao.length === 0 && (
                            <View style={{width: '100%', alignItems: 'center', marginTop: 40}}>
                                <Text style={{color: '#999', fontSize: 16}}>Nenhuma receita encontrada para estes filtros.</Text>
                            </View>
                        )}
                    </View>
                </ScrollView>
                
                <NovaReceita 
                    visible={this.state.modalVisivel} 
                    onClose={this.fecharModal} 
                    autorId={this.state.usuarioId}     
                    autorNome={this.state.usuarioNome} 
                />

                <ExibirReceita
                    visible={this.state.modalExibirVisivel}
                    receita={this.state.receitaSelecionada}
                    onClose={this.fecharModalExibir}
                    onToggleFavorito={this.toggleFavorito}
                    onMarcarFeita={this.marcarReceitaFeita}
                    isFavorito={this.state.receitaSelecionada ? this.state.idsFavoritos.includes(this.state.receitaSelecionada._id || this.state.receitaSelecionada.id!) : false}
                    isFeita={this.state.receitaSelecionada ? this.state.idsHistorico.includes(this.state.receitaSelecionada._id || this.state.receitaSelecionada.id!) : false}
                />

                <FooterCustomizado />
            </View>
        )
    }
}