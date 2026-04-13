import React from 'react';
import { View, TextInput, Pressable, Text, ScrollView } from 'react-native';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import AntDesign from '@expo/vector-icons/AntDesign';

interface Props {
    termoPesquisa: string;
    onChangeTermoPesquisa: (texto: string) => void;
    filtrosVisiveis: boolean;
    onToggleFiltros: () => void;
    filtroHabilidade: string[];
    filtroCulinaria: string[];
    filtroRestricoes: string[];
    onToggleItemLista: (listaAlvo: 'filtroHabilidade' | 'filtroCulinaria' | 'filtroRestricoes', item: string) => void;
    onLimparFiltros: () => void;
}

export default function FiltrosReceita({
    termoPesquisa, onChangeTermoPesquisa, filtrosVisiveis, onToggleFiltros,
    filtroHabilidade, filtroCulinaria, filtroRestricoes, onToggleItemLista, onLimparFiltros
}: Props) {
    const opcoesHabilidade = ["Iniciante", "Intermediário", "Profissional"];
    const opcoesCulinaria = ["Japonesa", "Italiana", "Brasileira", "Mexicana"];
    const opcoesRestricoes = ["Vegetariano", "Vegano", "Intolerante a Lactose", "Alérgico a Amendoim", "Alérgico a frutos do mar", "Sem Glúten"];

    const temFiltroAtivo = filtroHabilidade.length > 0 || filtroCulinaria.length > 0 || filtroRestricoes.length > 0;

    return (
        <View style={{ padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#ddd', zIndex: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#eee', borderRadius: 10, paddingHorizontal: 10, height: 45 }}>
                    <EvilIcons name="search" size={20} color="#777" />
                    <TextInput
                        style={{ flex: 1, marginLeft: 10, color: '#333' }}
                        placeholder="Pesquisar receitas..."
                        value={termoPesquisa}
                        onChangeText={onChangeTermoPesquisa}
                    />
                    {termoPesquisa !== "" && (
                        <Pressable onPress={() => onChangeTermoPesquisa('')}>
                            <AntDesign name="close-circle" size={16} color="#bbb" />
                        </Pressable>
                    )}
                </View>

                <Pressable
                    onPress={onToggleFiltros}
                    style={{ height: 45, width: 45, backgroundColor: filtrosVisiveis ? '#FF9D4D' : '#eee', justifyContent: 'center', alignItems: 'center', borderRadius: 10 }}
                >
                    <AntDesign name="filter" size={24} color={filtrosVisiveis ? '#fff' : '#555'} />
                </Pressable>
            </View>

            {filtrosVisiveis && (
                <View style={{ marginTop: 15 }}>
                    <Text style={{ fontWeight: 'bold', color: '#555', marginBottom: 5 }}>Nível de Habilidade</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
                        {opcoesHabilidade.map(item => {
                            const selecionado = filtroHabilidade.includes(item);
                            return (
                                <Pressable key={item} onPress={() => onToggleItemLista('filtroHabilidade', item)}
                                    style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: selecionado ? '#FF9D4D' : '#f0f0f0', marginRight: 8, borderWidth: 1, borderColor: selecionado ? '#FF9D4D' : '#ddd' }}>
                                    <Text style={{ color: selecionado ? '#fff' : '#666', fontSize: 12 }}>{item}</Text>
                                </Pressable>
                            )
                        })}
                    </ScrollView>

                    <Text style={{ fontWeight: 'bold', color: '#555', marginBottom: 5 }}>Culinária</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
                        {opcoesCulinaria.map(item => {
                            const selecionado = filtroCulinaria.includes(item);
                            return (
                                <Pressable key={item} onPress={() => onToggleItemLista('filtroCulinaria', item)}
                                    style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: selecionado ? '#FF9D4D' : '#f0f0f0', marginRight: 8, borderWidth: 1, borderColor: selecionado ? '#FF9D4D' : '#ddd' }}>
                                    <Text style={{ color: selecionado ? '#fff' : '#666', fontSize: 12 }}>{item}</Text>
                                </Pressable>
                            )
                        })}
                    </ScrollView>

                    <Text style={{ fontWeight: 'bold', color: '#555', marginBottom: 5 }}>Restrições atreladas</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                        {opcoesRestricoes.map(item => {
                            const selecionado = filtroRestricoes.includes(item);
                            return (
                                <Pressable key={item} onPress={() => onToggleItemLista('filtroRestricoes', item)}
                                    style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: selecionado ? '#FF9D4D' : '#f0f0f0', marginRight: 8, borderWidth: 1, borderColor: selecionado ? '#FF9D4D' : '#ddd' }}>
                                    <Text style={{ color: selecionado ? '#fff' : '#666', fontSize: 12 }}>{item}</Text>
                                </Pressable>
                            )
                        })}
                    </ScrollView>

                    {temFiltroAtivo && (
                        <Pressable onPress={onLimparFiltros} style={{ alignSelf: 'flex-end', paddingVertical: 5 }}>
                            <Text style={{ color: '#FF9D4D', fontWeight: 'bold', fontSize: 12, textDecorationLine: 'underline' }}>Limpar Filtros</Text>
                        </Pressable>
                    )}
                </View>
            )}
        </View>
    );
}