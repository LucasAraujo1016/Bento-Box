import React, { Component } from 'react';
import { View, ScrollView, Text, Pressable, StyleSheet, TouchableOpacity } from 'react-native';
import FooterCustomizado from './components/footer';
import HeaderCustomizado from './components/header';
import CabecalhoSecao from './components/cabecalhoSecao';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import style from './styleSheet';

interface Refeicao {
    id: string;
    tipo: string;
    nome: string;
}

interface PlanejamentoState {
    cardapio: { [key: string]: Refeicao[] };
}

export default class PlanejamentoSemanal extends Component<any, PlanejamentoState> {
    
    diasDaSemana = [
        'Segunda-feira', 
        'Terça-feira', 
        'Quarta-feira', 
        'Quinta-feira', 
        'Sexta-feira', 
        'Sábado', 
        'Domingo'
    ];

    constructor(props: any) {
        super(props);
        this.state = {
            cardapio: {} // Inicialmente vazio
        };
    }

    // Simula a geração automática de um cardápio baseado no perfil
    gerarCardapioInteligente = () => {
        const cardapioGerado: { [key: string]: Refeicao[] } = {};
        
        this.diasDaSemana.forEach(dia => {
            cardapioGerado[dia] = [
                { id: '1', tipo: 'Almoço', nome: 'Frango Grelhado com Batata Doce' },
                { id: '2', tipo: 'Jantar', nome: 'Salada de Quinoa com Salmão' }
            ];
        });

        this.setState({ cardapio: cardapioGerado });
        console.log("Cardápio gerado com base no perfil do usuário.");
    }

    // Simula a troca de uma refeição específica caso o usuário não goste da sugestão
    trocarRefeicao = (dia: string, indexRefeicao: number) => {
        const novoCardapio = { ...this.state.cardapio };
        novoCardapio[dia][indexRefeicao].nome = "Nova Sugestão: Omelete de Espinafre";
        this.setState({ cardapio: novoCardapio });
    }

    render() {
        const { cardapio } = this.state;

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

                    {/* Botão para gerar o cardápio automaticamente */}
                    <TouchableOpacity 
                        style={style.botaoGerar}
                        onPress={this.gerarCardapioInteligente}
                    >
                        <FontAwesome5 name="magic" size={16} color="#FFF" style={{ marginRight: 10 }} />
                        <Text style={style.textoBotaoGerar}>Gerar Cardápio Inteligente</Text>
                    </TouchableOpacity>

                    {/* Mapeamento dos dias da semana */}
                    {this.diasDaSemana.map((dia, index) => {
                        const refeicoesDoDia = cardapio[dia];

                        return (
                            <View key={index} style={style.cardDia}>
                                {/* Topo do Card com o nome do dia e botão adicionar (manual) */}
                                <View style={style.topoCard}>
                                    <Text style={style.tituloDia}>{dia}</Text>
                                    <Pressable 
                                        style={{ padding: 4 }} 
                                        onPress={() => console.log(`Adicionar refeição manual para ${dia}`)}
                                    >
                                        <FontAwesome5 name="plus-circle" size={20} color="#FF9D4D" solid />
                                    </Pressable>
                                </View>

                                {/* Renderiza as refeições sugeridas ou o estado vazio */}
                                {refeicoesDoDia && refeicoesDoDia.length > 0 ? (
                                    refeicoesDoDia.map((refeicao, refIndex) => (
                                        <View key={refIndex} style={style.refeicaoItem}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={style.tipoRefeicao}>{refeicao.tipo}</Text>
                                                <Text style={style.nomeRefeicao}>{refeicao.nome}</Text>
                                            </View>
                                            
                                            {/* Ações para a refeição: Trocar (regenerar) ou Editar/Remover */}
                                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                                <Pressable onPress={() => this.trocarRefeicao(dia, refIndex)}>
                                                    <FontAwesome5 name="sync-alt" size={16} color="#4A90E2" />
                                                </Pressable>
                                                <Pressable onPress={() => console.log('Remover refeição')}>
                                                    <FontAwesome5 name="trash" size={16} color="#FF5252" />
                                                </Pressable>
                                            </View>
                                        </View>
                                    ))
                                ) : (
                                    <View style={style.estadoVazioPlanejamento}>
                                        <FontAwesome5 name="utensils" size={24} color="#ccc" style={{ marginBottom: 8 }} />
                                        <Text style={{ color: '#999', fontSize: 14, textAlign: 'center' }}>
                                            Nenhuma refeição planejada. Pressione o botão acima para gerar sugestões.
                                        </Text>
                                    </View>
                                )}
                            </View>
                        );
                    })}

                </ScrollView>

                <FooterCustomizado />
            </View>
        );
    }
}

