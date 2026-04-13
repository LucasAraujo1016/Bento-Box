import React, { Component } from 'react';
import { View, ScrollView, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HeaderCustomizado from './components/header';
import FooterCustomizado from './components/footer';
import ReceitaCard, { ReceitaItem } from './components/receitas/receitaCard';
import ExibirReceita from './components/receitas/exibirReceita';
import CabecalhoSecao from './components/cabecalhoSecao';
import EstadoVazio from './components/estadoVazio';
import style from "./styleSheet";

interface State {
    historicoReceitas: ReceitaItem[];
    carregando: boolean;
    receitaSelecionada: ReceitaItem | null;
    modalExibirVisivel: boolean;
    idsHistorico: string[];
    idsFavoritos: string[];
    usuarioId: string;
}

export default class Historico extends Component<any, State> {
    state: State = {
        historicoReceitas: [],
        carregando: true,
        receitaSelecionada: null,
        modalExibirVisivel: false,
        idsHistorico: [],
        idsFavoritos: [],
        usuarioId: "",
    };

    async componentDidMount() {
        const uid = await AsyncStorage.getItem('usuarioId');
        
        if (uid) {
            this.setState({ usuarioId: uid }, () => {
                this.buscarHistorico();
                this.buscarFavoritosDoBanco();
            });
        } else {
            Alert.alert("Erro", "Sessão expirada. Volte para o login.");
        }
    }

    buscarHistorico = async () => {
        this.setState({ carregando: true });
        try {
            const resposta = await fetch(`http://localhost:3000/api/historico/${this.state.usuarioId}`);
            
            if (resposta.ok) {
                const dados: ReceitaItem[] = await resposta.json();
                const ids = dados.map(item => item._id || item.id).filter(id => id !== undefined) as string[];
                
                this.setState({ 
                    historicoReceitas: dados, 
                    idsHistorico: ids 
                });
            } else {
                console.error("Falha ao buscar o histórico. Status:", resposta.status);
            }
        } catch (error) {
            console.error("Erro de conexão ao buscar histórico:", error);
        } finally {
            this.setState({ carregando: false });
        }
    };

    buscarFavoritosDoBanco = async () => {
        try {
            const resposta = await fetch(`http://localhost:3000/api/favoritos/${this.state.usuarioId}`);
            if (resposta.ok) {
                const dados = await resposta.json();
                const ids = dados.map((item: any) => item._id || item.id).filter((id: any) => id !== undefined);
                this.setState({ idsFavoritos: ids });
            }
        } catch (error) {
            console.error("Erro ao buscar favoritos no histórico:", error);
        }
    };

    abrirReceitaDetalhes = (receita: ReceitaItem) => {
        this.setState({ receitaSelecionada: receita, modalExibirVisivel: true });
    };

    fecharModalExibir = () => {
        this.setState({ modalExibirVisivel: false, receitaSelecionada: null });
        this.buscarHistorico();
        this.buscarFavoritosDoBanco();
    };

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
    };

    marcarReceitaFeita = async (receita: ReceitaItem) => {
        const id = receita._id || receita.id;
        if (!id) return;

        try {
            await fetch('http://localhost:3000/api/historico/toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    usuarioId: this.state.usuarioId,
                    receitaId: id
                })
            });

            this.buscarHistorico(); 
            
        } catch {
            Alert.alert("Erro", "Falha ao registrar interação.");
        }
    };

    render() {
        const { historicoReceitas, carregando, modalExibirVisivel, receitaSelecionada, idsHistorico, idsFavoritos } = this.state;

        return (
            <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
                <HeaderCustomizado />

                <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20 }}>
                    
                    <CabecalhoSecao 
                        titulo="Meu Histórico" 
                        subtitulo={`Receitas que você já preparou (${historicoReceitas.length})`} 
                        icone="scroll" 
                        corIcone="#333"
                    />

                    {carregando ? (
                        <View style={{ marginTop: 50 }}>
                            <ActivityIndicator size="large" color="#FF9D4D" />
                        </View>
                    ) : historicoReceitas.length === 0 ? (
                        <EstadoVazio 
                            titulo="Nenhuma receita feita ainda."
                            subtitulo="Que tal ir na aba de Receitas e começar a cozinhar?"
                        />
                    ) : (
                        <View style={style.gridContainer}>
                            {historicoReceitas.map((receita) => (
                                <ReceitaCard
                                    key={receita._id || receita.id || Math.random().toString()} 
                                    receita={receita} 
                                    onPress={this.abrirReceitaDetalhes} 
                                />
                            ))}
                        </View>
                    )}
                </ScrollView>

                <ExibirReceita
                    visible={modalExibirVisivel}
                    receita={receitaSelecionada}
                    onClose={this.fecharModalExibir}
                    onToggleFavorito={this.toggleFavorito}
                    onMarcarFeita={this.marcarReceitaFeita}
                    isFavorito={receitaSelecionada ? idsFavoritos.includes(receitaSelecionada._id || receitaSelecionada.id!) : false}
                    isFeita={receitaSelecionada ? idsHistorico.includes(receitaSelecionada._id || receitaSelecionada.id!) : false}
                />

                <FooterCustomizado />
            </View>
        );
    }
}