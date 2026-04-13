import { Component } from "react";
import { View, ScrollView, Text, Image, Pressable, ActivityIndicator } from "react-native";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import HeaderCustomizado from "./components/header";
import FooterCustomizado from "./components/footer";
import { ReceitaItem } from "./components/receitas/receitaCard";
import ExibirReceita from "./components/receitas/exibirReceita";
import style from "./styleSheet";

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
                    
                    {carregando ? (
                        <View style={{ marginTop: 50 }}>
                            <ActivityIndicator size="large" color="#FF9D4D" />
                        </View>
                    ) : receitaDoDia ? (
                        <Pressable style={style.destaqueCard} onPress={this.abrirReceita}>
                            <View style={style.headerInternoWrapper}>
                                <View style={style.headerInterno}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <FontAwesome5 name="star" size={18} color="#FF9D4D" solid style={{ marginRight: 8 }} />
                                        <Text style={style.headerInternoTitulo}>Receita do Dia</Text>
                                    </View>
                                    <Text style={style.headerInternoSub}>Escolhida especialmente para você hoje!</Text>
                                </View>
                            </View>

                            {receitaDoDia.imagem ? (
                                <Image source={{ uri: receitaDoDia.imagem }} style={style.destaqueImagem} />
                            ) : (
                                <View style={[style.destaqueImagem, style.placeholder]}>
                                    <Text style={{color: '#a0a0a0'}}>Sem Imagem</Text>
                                </View>
                            )}
                            <View style={style.destaqueInfo}>
                                <Text style={style.destaqueNome}>{receitaDoDia.nome}</Text>
                                <Text style={style.destaqueCulinaria}>{receitaDoDia.tipoCulinaria}</Text>
                                {receitaDoDia.descricao && (
                                    <Text style={style.destaqueDescricao} numberOfLines={3}>
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

                    {dicaDoDia ? (
                        <View style={style.dicaCard}>
                            <View style={style.headerInterno}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <FontAwesome5 name="lightbulb" size={18} color="#FF9D4D" solid style={{ marginRight: 8 }} />
                                    <Text style={style.headerInternoTitulo}>Dica do Dia</Text>
                                </View>
                                <Text style={style.headerInternoSub}>Aprenda algo novo para sua cozinha!</Text>
                            </View>

                            <Text style={style.dicaTitulo}>{dicaDoDia.titulo}</Text>
                            <Text style={style.dicaTexto}>{dicaDoDia.conteudo}</Text>
                        </View>
                    ) : (
                        <ActivityIndicator size="small" color="#FF9D4D" style={{ marginTop: 20 }} />
                    )}

                    <Pressable style={style.quizCard}>
                        <View style={style.headerInterno}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <FontAwesome5 name="brain" size={18} color="#FF9D4D" style={{ marginRight: 8 }} />
                                <Text style={style.headerInternoTitulo}>Teste seus Conhecimentos</Text>
                            </View>
                            <Text style={style.headerInternoSub}>Descubra o quanto você sabe sobre culinária!</Text>
                        </View>

                        <View style={style.quizInnerRow}>
                            <View style={style.quizConteudo}>
                                <Text style={style.quizTitulo}>Quiz Gastronômico</Text>
                                <Text style={style.quizTexto}>Teste suas habilidades e aprenda curiosidades respondendo perguntas rápidas.</Text>
                            </View>
                            <View style={style.quizEmBreveBadge}>
                                <Text style={style.quizEmBreveTexto}>EM BREVE</Text>
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