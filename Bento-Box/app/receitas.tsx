import { Component } from "react";
import { View, ScrollView, Text, Pressable, TextInput } from "react-native";
import HeaderCustomizado from "./components/header";
import FooterCustomizado from "./components/footer";
import NovaReceita from "./components/novaReceita"; 
import AntDesign from '@expo/vector-icons/AntDesign';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import style from "./styleSheet";
import ReceitaCard, { ReceitaItem } from "./components/receitaCard";
import ExibirReceita from "./components/exibirReceita";

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
    };

    componentDidMount() {
        this.buscarReceitasDoBanco();
    }

    buscarReceitasDoBanco = async () => {
        try {
            // Faz a requisição para a rota GET que acabamos de criar
            const resposta = await fetch('http://localhost:3000/api/receitas');
            
            if (resposta.ok) {
                const dadosBanco = await resposta.json();
                
                // Atualiza o estado com os dados que vieram do MongoDB
                this.setState({ receitasOriginais: dadosBanco }, () => {
                    this.embaralharReceitas(); // Mantém a visualização embaralhada
                });
            } else {
                console.error("Falha ao buscar as receitas, status:", resposta.status);
            }
        } catch (error) {
            console.error("Erro de conexão ao buscar receitas:", error);
        }
    }

    embaralharReceitas = () => {
        const copiadas = [...this.state.receitasOriginais];
        // Algoritmo simples de embaralhar (Sort random)
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

    // Aplica as regras de filtragem na lista
    obterReceitasFiltradas = () => {
        const { receitasEmbaralhadas, termoPesquisa, filtroHabilidade, filtroCulinaria, filtroRestricoes } = this.state;
        
        let resultado = receitasEmbaralhadas;

        // 1. Filtro por Texto na Barra de Busca (Nome)
        if (termoPesquisa.trim() !== '') {
            const termo = termoPesquisa.toLowerCase();
            resultado = resultado.filter(receita => receita.nome.toLowerCase().includes(termo));
        }

        // 2. Filtros Exatos de Categoria e Nível
        if (filtroHabilidade.length > 0) {
            // Converte "Intermediário" para "intermediario", e os outros para letras minúsculas
            const valoresHabilidade = filtroHabilidade.map(f => 
                f === "Intermediário" ? "intermediario" : f.toLowerCase()
            );
            
            // Garantir que a leitura suporte até as receitas salvas sem estar minúsculas acidentalmente (?.toLowerCase())
            resultado = resultado.filter(receita => 
                receita.nivelHabilidade && valoresHabilidade.includes(receita.nivelHabilidade.toLowerCase())
            );
        }
        
        if (filtroCulinaria.length > 0) {
            // Converte para letras minúsculas (ex: "Brasileira" -> "brasileira")
            const valoresCulinaria = filtroCulinaria.map(f => f.toLowerCase());
            
            resultado = resultado.filter(receita => 
                receita.tipoCulinaria && valoresCulinaria.includes(receita.tipoCulinaria.toLowerCase())
            );
        }

        // 3. Filtros (Restrições)
        // Lógica de "E" (AND): A receita precisa ter TODAS as restrições selecionadas.
        if (filtroRestricoes.length > 0) {
            resultado = resultado.filter(receita => {
                const restricoesReceita = receita.restricoes || [];
                // Retorna true APENAS se a receita possuir TODAS as restrições marcadas no filtro
                return filtroRestricoes.every(restricaoSelecionada => restricoesReceita.includes(restricaoSelecionada));
            });
        }

        return resultado;
    }

    // Ação ao clicar em um Card
    abrirReceitaDetalhes = (receita: ReceitaItem) => {
        this.setState({ receitaSelecionada: receita, modalExibirVisivel: true });
    }

    fecharModalExibir = () => {
        this.setState({ modalExibirVisivel: false, receitaSelecionada: null });
    }

    toggleFavorito = (receita: ReceitaItem) => {
        // Usa '_id' se vier do Mongo, senão usa 'id' do mock
        const id = receita._id || receita.id;
        if(!id) return;

        this.setState(prev => {
            const jaFavorito = prev.idsFavoritos.includes(id);
            if (jaFavorito) {
                return { idsFavoritos: prev.idsFavoritos.filter(item => item !== id) };
            } else {
                return { idsFavoritos: [...prev.idsFavoritos, id] };
            }
        });
    }

    marcarReceitaFeita = (receita: ReceitaItem) => {
        const id = receita._id || receita.id;
        if(!id) return;

        this.setState(prev => {
            const jaFeita = prev.idsHistorico.includes(id);
            if (jaFeita) {
                // Se já estiver marcada, remove o id da lista (desmarca)
                return { idsHistorico: prev.idsHistorico.filter(item => item !== id) };
            } else {
                // Se não estiver, adiciona o id à lista (marca)
                return { idsHistorico: [...prev.idsHistorico, id] };
            }
        });
    }

    render() {
        const opcoesHabilidade = ["Iniciante", "Intermediário", "Profissional"];
        const opcoesCulinaria = ["Japonesa", "Italiana", "Brasileira", "Mexicana"];
        const opcoesRestricoes = ["Vegetariano", "Vegano", "Intolerante a Lactose", "Alérgico a Amendoim", "Alérgico a frutos do mar", "Sem Glúten"];

        const listaExibicao = this.obterReceitasFiltradas();

        return (
            <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}> 
                <HeaderCustomizado />
                
                <View style={{ padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#ddd', zIndex: 10 }}>
                    <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
                        <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#eee', borderRadius: 10, paddingHorizontal: 10, height: 45}}>
                            <EvilIcons name="search" size={20} color="#777" />
                            <TextInput 
                                style={{flex: 1, marginLeft: 10, color: '#333'}}
                                placeholder="Pesquisar receitas..."
                                value={this.state.termoPesquisa}
                                onChangeText={(t) => this.setState({termoPesquisa: t})}
                            />
                            {this.state.termoPesquisa !== "" && (
                                <Pressable onPress={() => this.setState({termoPesquisa: ''})}>
                                    <AntDesign name="close-circle" size={16} color="#bbb" />
                                </Pressable>
                            )}
                        </View>
                        
                        <Pressable 
                            onPress={this.toggleFiltros} 
                            style={{height: 45, width: 45, backgroundColor: this.state.filtrosVisiveis ? '#FF9D4D' : '#eee', justifyContent: 'center', alignItems: 'center', borderRadius: 10}}
                        >
                            <AntDesign name="filter" size={24} color={this.state.filtrosVisiveis ? '#fff' : '#555'} />
                        </Pressable>
                    </View>

                    {this.state.filtrosVisiveis && (
                        <View style={{marginTop: 15}}>
                            
                            <Text style={{fontWeight: 'bold', color: '#555', marginBottom: 5}}>Nível de Habilidade</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 15}}>
                                {opcoesHabilidade.map(item => {
                                    const selecionado = this.state.filtroHabilidade.includes(item);
                                    return (
                                        <Pressable key={item} onPress={() => this.toggleItemLista('filtroHabilidade', item)}
                                            style={{paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: selecionado ? '#FF9D4D' : '#f0f0f0', marginRight: 8, borderWidth: 1, borderColor: selecionado ? '#FF9D4D' : '#ddd'}}>
                                            <Text style={{color: selecionado ? '#fff' : '#666', fontSize: 12}}>{item}</Text>
                                        </Pressable>
                                    )
                                })}
                            </ScrollView>

                            <Text style={{fontWeight: 'bold', color: '#555', marginBottom: 5}}>Culinária</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 15}}>
                                {opcoesCulinaria.map(item => {
                                    const selecionado = this.state.filtroCulinaria.includes(item);
                                    return (
                                        <Pressable key={item} onPress={() => this.toggleItemLista('filtroCulinaria', item)}
                                            style={{paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: selecionado ? '#FF9D4D' : '#f0f0f0', marginRight: 8, borderWidth: 1, borderColor: selecionado ? '#FF9D4D' : '#ddd'}}>
                                            <Text style={{color: selecionado ? '#fff' : '#666', fontSize: 12}}>{item}</Text>
                                        </Pressable>
                                    )
                                })}
                            </ScrollView>

                            <Text style={{fontWeight: 'bold', color: '#555', marginBottom: 5}}>Restrições atreladas</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 10}}>
                                {opcoesRestricoes.map(item => {
                                    const selecionado = this.state.filtroRestricoes.includes(item);
                                    return (
                                        <Pressable key={item} onPress={() => this.toggleItemLista('filtroRestricoes', item)}
                                            style={{paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: selecionado ? '#FF9D4D' : '#f0f0f0', marginRight: 8, borderWidth: 1, borderColor: selecionado ? '#FF9D4D' : '#ddd'}}>
                                            <Text style={{color: selecionado ? '#fff' : '#666', fontSize: 12}}>{item}</Text>
                                        </Pressable>
                                    )
                                })}
                            </ScrollView>
                            
                            {(this.state.filtroHabilidade.length > 0 || this.state.filtroCulinaria.length > 0 || this.state.filtroRestricoes.length > 0) && (
                                <Pressable onPress={this.limparFiltros} style={{alignSelf: 'flex-end', paddingVertical: 5}}>
                                    <Text style={{color: '#FF9D4D', fontWeight: 'bold', fontSize: 12, textDecorationLine: 'underline'}}>Limpar Filtros</Text>
                                </Pressable>
                            )}

                        </View>
                    )}
                </View>
                
                {/* --- CONTEÚDO PRINCIPAL (COM GRID) --- */}
                <ScrollView contentContainerStyle={{flexGrow: 1, padding: 20}}>
                    
                    {/* Botão de Criação ocupa 1 linha inteira no topo */}
                    <Pressable style={[style.nova_receita, {marginBottom: 20, backgroundColor: '#FF9D4D', alignSelf: 'center'}]} onPress={this.abrirModal}>
                        <AntDesign name="plus-circle" size={24} color="white" />                           
                        <Text style={{fontSize: 16, fontWeight: 'bold', color: 'white', marginLeft: 8}}>Criar Nova Receita</Text>
                    </Pressable>

                    {/* MURAL EM GRID (flex-wrap e space-between) */}
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