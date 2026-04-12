import React, { Component } from 'react';
import { View, ScrollView, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import AsyncStorage from '@react-native-async-storage/async-storage';

import HeaderCustomizado from './components/header';
import FooterCustomizado from './components/footer';
import ReceitaCard, { ReceitaItem } from './components/receitas/receitaCard';
import ExibirReceita from './components/receitas/exibirReceita';

interface State {
    favoritosReceitas: ReceitaItem[];
    carregando: boolean;
    receitaSelecionada: ReceitaItem | null;
    modalExibirVisivel: boolean;
    idsHistorico: string[];
    idsFavoritos: string[];
    usuarioId: string;
}

export default class Favoritos extends Component<any, State> {
    state: State = {
        favoritosReceitas: [],
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
                this.buscarFavoritos();
                this.buscarHistoricoDoBanco();
            });
        }
    }

    buscarFavoritos = async () => {
        this.setState({ carregando: true });
        try {
            const resposta = await fetch(`http://localhost:3000/api/favoritos/${this.state.usuarioId}`);
            
            if (resposta.ok) {
                const dados: ReceitaItem[] = await resposta.json();
                const ids = dados.map(item => item._id || item.id).filter(id => id !== undefined) as string[];
                
                this.setState({ favoritosReceitas: dados, idsFavoritos: ids });
            } else {
                console.error("Falha ao buscar favoritos. Status:", resposta.status);
            }
        } catch (error) {
            console.error("Erro ao buscar favoritos:", error);
        } finally {
            this.setState({ carregando: false });
        }
    };

    // Pega o histórico para que os corações E as marcações de 'feita' fiquem certas nesta tela
    buscarHistoricoDoBanco = async () => {
        try {
            const resposta = await fetch(`http://localhost:3000/api/historico/${this.state.usuarioId}`);
            if (resposta.ok) {
                const dados = await resposta.json();
                const ids = dados.map((item: any) => item._id || item.id).filter((id: any) => id !== undefined);
                this.setState({ idsHistorico: ids });
            }
        } catch (error) {
            console.error("Erro ao buscar histórico nos favoritos:", error);
        }
    };

    abrirReceitaDetalhes = (receita: ReceitaItem) => this.setState({ receitaSelecionada: receita, modalExibirVisivel: true });
    fecharModalExibir = () => {
        this.setState({ modalExibirVisivel: false, receitaSelecionada: null });
        this.buscarFavoritos();
    };

    // Comunica com o backend de Favoritos
    toggleFavorito = async (receita: ReceitaItem) => {
        const id = receita._id || receita.id;
        if (!id) return;

        try {
            await fetch('http://localhost:3000/api/favoritos/toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuarioId: this.state.usuarioId, receitaId: id })
            });
            this.buscarFavoritos(); 
        } catch (error) {
            Alert.alert("Erro", "Falha ao favoritar.");
        }
    };

    // Comunica com o backend de Histórico (se ele marcar como feita aqui)
    marcarReceitaFeita = async (receita: ReceitaItem) => {
        const id = receita._id || receita.id;
        if (!id) return;

        this.setState(prev => {
            const jaFeita = prev.idsHistorico.includes(id);
            return { idsHistorico: jaFeita ? prev.idsHistorico.filter(item => item !== id) : [...prev.idsHistorico, id] };
        });

        try {
            await fetch('http://localhost:3000/api/historico/toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuarioId: this.state.usuarioId, receitaId: id })
            });
        } catch (error) {
            console.error("Erro ao salvar histórico", error);
        }
    };

    render() {
        const { favoritosReceitas, carregando, modalExibirVisivel, receitaSelecionada, idsHistorico, idsFavoritos } = this.state;

        return (
            <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
                <HeaderCustomizado />

                <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20 }}>
                    
                    <View style={styles.headerInternoWrapper}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                            <FontAwesome5 name="heart" solid size={22} color="#E53935" style={{ marginRight: 10 }} />
                            <Text style={styles.tituloSecao}>Meus Favoritos</Text>
                        </View>
                        <Text style={styles.subtituloSecao}>Suas receitas preferidas guardadas ({favoritosReceitas.length})</Text>
                    </View>

                    {carregando ? (
                        <View style={{ marginTop: 50 }}>
                            <ActivityIndicator size="large" color="#FF9D4D" />
                        </View>
                    ) : favoritosReceitas.length === 0 ? (
                        <View style={styles.vazioContainer}>
                            <Text style={styles.vazioTexto}>Você ainda não possui favoritos.</Text>
                            <Text style={styles.vazioSubtexto}>Explore receitas e clique no coração para salvar suas preferidas!</Text>
                        </View>
                    ) : (
                        <View style={styles.gridContainer}>
                            {favoritosReceitas.map((receita) => (
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

const styles = StyleSheet.create({
    headerInternoWrapper: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
        paddingBottom: 15,
        alignItems: 'center',
    },
    tituloSecao: {
        fontSize: 24, 
        fontWeight: 'bold', 
        color: '#333'
    },
    subtituloSecao: {
        fontSize: 14, 
        color: '#666', 
        marginTop: 5
    },
    gridContainer: {
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        justifyContent: 'space-between', 
        width: '100%'
    },
    vazioContainer: {
        alignItems: 'center', 
        justifyContent: 'center', 
        marginTop: 50,
        backgroundColor: '#fff',
        padding: 30,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#eee'
    },
    vazioTexto: {
        fontSize: 18, 
        fontWeight: 'bold', 
        color: '#555', 
        marginBottom: 5 
    },
    vazioSubtexto: {
        fontSize: 14, 
        color: '#888', 
        textAlign: 'center',
        paddingHorizontal: 20 
    }
});