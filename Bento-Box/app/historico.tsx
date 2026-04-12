import React, { Component } from 'react';
import { View, ScrollView, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Importação dos seus componentes padrão
import HeaderCustomizado from './components/header';
import FooterCustomizado from './components/footer';
import ReceitaCard, { ReceitaItem } from './components/receitas/receitaCard';
import ExibirReceita from './components/receitas/exibirReceita';

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
        idsFavoritos: [], // Adicionado para evitar erro no modal
        usuarioId: "", // ID dinâmico preenchido pelo AsyncStorage
    };

    async componentDidMount() {
        // RECUPERA O USUÁRIO LOGADO ANTES DE BUSCAR AS COISAS
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
            // Requisição usando this.state.usuarioId dinâmico
            const resposta = await fetch(`http://localhost:3000/api/historico/${this.state.usuarioId}`);
            
            if (resposta.ok) {
                const dados: ReceitaItem[] = await resposta.json();
                
                // Extrair os IDs para manter coerência com o marcador "isFeita" do ExibirReceita
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
            // Requisição usando this.state.usuarioId dinâmico
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

    // Gerenciamento do Modal de Detalhes
    abrirReceitaDetalhes = (receita: ReceitaItem) => {
        this.setState({ receitaSelecionada: receita, modalExibirVisivel: true });
    };

    fecharModalExibir = () => {
        this.setState({ modalExibirVisivel: false, receitaSelecionada: null });
        // Recarrega o histórico e os favoritos caso o usuário os tenha alterado lá dentro
        this.buscarHistorico();
        this.buscarFavoritosDoBanco();
    };

    // Ações de Botões no Modal
    toggleFavorito = async (receita: ReceitaItem) => {
        const id = receita._id || receita.id;
        if (!id) return;

        // Atualização visual instantânea (Optimistic UI)
        this.setState(prev => {
            const jaFavorito = prev.idsFavoritos.includes(id);
            if (jaFavorito) {
                return { idsFavoritos: prev.idsFavoritos.filter(item => item !== id) };
            } else {
                return { idsFavoritos: [...prev.idsFavoritos, id] };
            }
        });

        // Chamada para a API salvando no backend
        try {
            await fetch('http://localhost:3000/api/favoritos/toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    usuarioId: this.state.usuarioId,
                    receitaId: id
                })
            });
        } catch (error) {
            Alert.alert("Erro", "Falha ao registrar favorito.");
        }
    };

    marcarReceitaFeita = async (receita: ReceitaItem) => {
        const id = receita._id || receita.id;
        if (!id) return;

        try {
            // Chamada para a API marcando/desmarcando a receita no backend
            await fetch('http://localhost:3000/api/historico/toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    usuarioId: this.state.usuarioId,
                    receitaId: id
                })
            });

            // Se o usuário clicar em desmarcar, nós já atualizamos a fonte da verdade chamando a busca
            this.buscarHistorico(); 
            
        } catch (error) {
            Alert.alert("Erro", "Falha ao registrar interação.");
        }
    };

    render() {
        const { historicoReceitas, carregando, modalExibirVisivel, receitaSelecionada, idsHistorico, idsFavoritos } = this.state;

        return (
            <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
                <HeaderCustomizado />

                <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20 }}>
                    
                    <View style={styles.headerInternoWrapper}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                            <FontAwesome5 name="scroll" size={22} color="#333" style={{ marginRight: 10 }} />
                            <Text style={styles.tituloSecao}>Meu Histórico</Text>
                        </View>
                        <Text style={styles.subtituloSecao}>Receitas que você já preparou ({historicoReceitas.length})</Text>
                    </View>

                    {carregando ? (
                        <View style={{ marginTop: 50 }}>
                            <ActivityIndicator size="large" color="#FF9D4D" />
                        </View>
                    ) : historicoReceitas.length === 0 ? (
                        <View style={styles.vazioContainer}>
                            <Text style={styles.vazioTexto}>Nenhuma receita feita ainda.</Text>
                            <Text style={styles.vazioSubtexto}>Que tal ir na aba de Receitas e começar a cozinhar?</Text>
                        </View>
                    ) : (
                        <View style={styles.gridContainer}>
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

                {/* Usa a mesma lógica padrão para injetar o Modal da receita na tela */}
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
        alignItems: 'center', // CentralizaHorizontalmente o cabeçalho
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
        textAlign: 'center' 
    }
});