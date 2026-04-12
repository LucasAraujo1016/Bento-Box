import { Component } from "react";
import { View, ScrollView, Text, Image, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'; // <-- Importação do FontAwesome5
import HeaderCustomizado from "./components/header";
import FooterCustomizado from "./components/footer";
import { ReceitaItem } from "./components/receitas/receitaCard";
import ExibirReceita from "./components/receitas/exibirReceita";

interface State {
    receitaDoDia: ReceitaItem | null;
    modalExibirVisivel: boolean;
    carregando: boolean;
    dicaDoDia: DicaItem | null; 
}

interface DicaItem {
    _id?: string;
    titulo: string;
    conteudo: string;
}

export default class Home extends Component<any, State> {
    state: State = {
        receitaDoDia: null,
        modalExibirVisivel: false,
        carregando: true,
        dicaDoDia: null,
    }

    componentDidMount() {
        this.buscarReceitaDoDia();
        this.buscarDicaDoDia();
    }

    buscarReceitaDoDia = async () => {
        try {
            const resposta = await fetch('http://localhost:3000/api/receitas');
            if (resposta.ok) {
                const receitas: ReceitaItem[] = await resposta.json();
                
                if (receitas.length > 0) {
                    const hoje = new Date();
                    const fusoAjuste = hoje.getTimezoneOffset() * 60000; 
                    const diasPassados = Math.floor((hoje.getTime() - fusoAjuste) / (1000 * 60 * 60 * 24));
                    
                    const indexDoDia = diasPassados % receitas.length;
                    
                    this.setState({ receitaDoDia: receitas[indexDoDia], carregando: false });
                } else {
                    this.setState({ carregando: false });
                }
            }
        } catch (error) {
            console.error("Erro ao buscar receita do dia:", error);
            this.setState({ carregando: false });
        }
    }

    buscarDicaDoDia = async () => {
        try {
            const resposta = await fetch('http://localhost:3000/api/dicas');
            if (resposta.ok) {
                const dicas: DicaItem[] = await resposta.json();
                
                if (dicas.length > 0) {
                    const hoje = new Date();
                    const fusoAjuste = hoje.getTimezoneOffset() * 60000; 
                    const diasPassados = Math.floor((hoje.getTime() - fusoAjuste) / (1000 * 60 * 60 * 24));
                    
                    const indexDoDia = diasPassados % dicas.length;
                    
                    this.setState({ dicaDoDia: dicas[indexDoDia] });
                }
            }
        } catch (error) {
            console.error("Erro ao buscar dica do dia:", error);
        }
    }

    abrirReceita = () => this.setState({ modalExibirVisivel: true });
    fecharReceita = () => this.setState({ modalExibirVisivel: false });

    toggleFavorito = () => {}
    marcarFeita = () => {}

    render() {
        const { receitaDoDia, carregando, dicaDoDia } = this.state;

        return (
            <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}> 
                <HeaderCustomizado />
                
                <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20 }}>
                    
                    {/* ------ RECEITA DO DIA ------ */}
                    {carregando ? (
                        <View style={{ marginTop: 50 }}>
                            <ActivityIndicator size="large" color="#FF9D4D" />
                        </View>
                    ) : receitaDoDia ? (
                        <Pressable style={styles.destaqueCard} onPress={this.abrirReceita}>
                            <View style={styles.headerInternoWrapper}>
                                <View style={styles.headerInterno}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <FontAwesome5 name="star" size={18} color="#FF9D4D" solid style={{ marginRight: 8 }} />
                                        <Text style={styles.headerInternoTitulo}>Receita do Dia</Text>
                                    </View>
                                    <Text style={styles.headerInternoSub}>Escolhida especialmente para você hoje!</Text>
                                </View>
                            </View>

                            {receitaDoDia.imagem ? (
                                <Image source={{ uri: receitaDoDia.imagem }} style={styles.destaqueImagem} />
                            ) : (
                                <View style={[styles.destaqueImagem, styles.placeholder]}>
                                    <Text style={{color: '#a0a0a0'}}>Sem Imagem</Text>
                                </View>
                            )}
                            <View style={styles.destaqueInfo}>
                                <Text style={styles.destaqueNome}>{receitaDoDia.nome}</Text>
                                <Text style={styles.destaqueCulinaria}>{receitaDoDia.tipoCulinaria}</Text>
                                {receitaDoDia.descricao && (
                                    <Text style={styles.destaqueDescricao} numberOfLines={3}>
                                        {receitaDoDia.descricao}
                                    </Text>
                                )}
                            </View>
                        </Pressable>
                    ) : (
                        <Text style={{ textAlign: 'center', marginTop: 20, color: '#999' }}>
                            Nenhuma receita disponível no momento.
                        </Text>
                    )}

                    {/* ------ DICA DO DIA ------ */}
                    {dicaDoDia ? (
                        <View style={styles.dicaCard}>
                            <View style={styles.headerInterno}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <FontAwesome5 name="lightbulb" size={18} color="#FF9D4D" solid style={{ marginRight: 8 }} />
                                    <Text style={styles.headerInternoTitulo}>Dica do Dia</Text>
                                </View>
                                <Text style={styles.headerInternoSub}>Aprenda algo novo para sua cozinha!</Text>
                            </View>

                            <Text style={styles.dicaTitulo}>{dicaDoDia.titulo}</Text>
                            <Text style={styles.dicaTexto}>{dicaDoDia.conteudo}</Text>
                        </View>
                    ) : (
                        <ActivityIndicator size="small" color="#FF9D4D" style={{ marginTop: 20 }} />
                    )}

                    {/* ------ QUIZ (EM BREVE) ------ */}
                    <Pressable style={styles.quizCard}>
                        <View style={styles.headerInterno}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <FontAwesome5 name="brain" size={18} color="#FF9D4D" style={{ marginRight: 8 }} />
                                <Text style={styles.headerInternoTitulo}>Teste seus Conhecimentos</Text>
                            </View>
                            <Text style={styles.headerInternoSub}>Descubra o quanto você sabe sobre culinária!</Text>
                        </View>

                        <View style={styles.quizInnerRow}>
                            <View style={styles.quizConteudo}>
                                <Text style={styles.quizTitulo}>Quiz Gastronômico</Text>
                                <Text style={styles.quizTexto}>Teste suas habilidades e aprenda curiosidades respondendo perguntas rápidas.</Text>
                            </View>
                            <View style={styles.quizEmBreveBadge}>
                                <Text style={styles.quizEmBreveTexto}>EM BREVE</Text>
                            </View>
                        </View>
                    </Pressable>

                </ScrollView>

                <ExibirReceita
                    visible={this.state.modalExibirVisivel}
                    receita={this.state.receitaDoDia}
                    onClose={this.fecharReceita}
                    onToggleFavorito={this.toggleFavorito}
                    onMarcarFeita={this.marcarFeita}
                    isFavorito={false}
                    isFeita={false}
                />
                
                <FooterCustomizado />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    headerInternoWrapper: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    headerInterno: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
        paddingBottom: 12,
        marginBottom: 15,
    },
    headerInternoTitulo: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF9D4D', 
    },
    headerInternoSub: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },

    // Todos os "destque..." corrigidos para "destaque..." 
    destaqueCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        overflow: 'hidden',
        elevation: 4, 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        marginBottom: 25,
    },
    destaqueImagem: {
        width: '100%',
        height: 220,
        backgroundColor: '#eaeaea',
    },
    placeholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    destaqueInfo: {
        padding: 20,
    },
    destaqueNome: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    destaqueCulinaria: {
        fontSize: 12,
        color: '#FF9D4D',
        textTransform: 'uppercase',
        fontWeight: 'bold',
        marginBottom: 10,
    },
    destaqueDescricao: {
        fontSize: 14,
        color: '#555',
        lineHeight: 20,
    },

    dicaCard: {
        backgroundColor: '#FFF3E0', 
        borderRadius: 12,
        padding: 20,
        borderLeftWidth: 6,
        borderLeftColor: '#FF9D4D', 
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        marginBottom: 25,
    },
    dicaTitulo: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#d8721c', 
        marginBottom: 8,
    },
    dicaTexto: {
        fontSize: 14,
        color: '#555',
        lineHeight: 22,
    },

    quizCard: {
        backgroundColor: '#fdfdfd',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 20,
        marginBottom: 30, 
    },
    quizInnerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    quizConteudo: {
        flex: 1,
        paddingRight: 15,
    },
    quizTitulo: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#666', 
        marginBottom: 5,
    },
    quizTexto: {
        fontSize: 13,
        color: '#888',
        lineHeight: 20,
    },
    quizEmBreveBadge: {
        backgroundColor: '#eee',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    quizEmBreveTexto: {
        color: '#777',
        fontSize: 10,
        fontWeight: 'bold',
    },
});