import React from 'react';
import { View, Text, Pressable, TouchableOpacity } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import style from '../../styleSheet';
import { ReceitaItem } from '../receitas/receitaCard';

interface CardDiaProps {
    dia: string;
    refeicoesDoDia: ReceitaItem[];
    onAbrirAdicionar: (dia: string) => void;
    onAbrirDetalhes: (receita: ReceitaItem) => void;
    onRemover: (dia: string, index: number) => void;
}

export default function CardDia({ dia, refeicoesDoDia, onAbrirAdicionar, onAbrirDetalhes, onRemover }: CardDiaProps) {
    return (
        <View style={style.cardDia}>
            <View style={style.topoCard}>
                <Text style={style.tituloDia}>{dia}</Text>
                <Pressable style={style.btnPaddingPadrao} onPress={() => onAbrirAdicionar(dia)}>
                    <FontAwesome5 name="plus-circle" size={20} color="#FF9D4D" solid />
                </Pressable>
            </View>

            {refeicoesDoDia.length > 0 ? (
                refeicoesDoDia.map((refeicao, refIndex) => (
                    <TouchableOpacity key={refIndex} style={style.refeicaoItem} onPress={() => onAbrirDetalhes(refeicao)}>
                        <View style={style.flexInfo}>
                            <Text style={style.nomeRefeicao}>{refeicao.nome}</Text>
                            {refeicao.tempoPreparo && (
                                <Text style={style.refeicaoTempo}>
                                    <FontAwesome5 name="clock" /> {refeicao.tempoPreparo} min
                                </Text>
                            )}
                        </View>
                        <View style={style.refeicaoAcoesWrapper}>
                            <Pressable onPress={(e) => { e.stopPropagation(); onRemover(dia, refIndex); }}>
                                <FontAwesome5 name="trash" size={16} color="#FF5252" />
                            </Pressable>
                        </View>
                    </TouchableOpacity>
                ))
            ) : (
                <View style={style.estadoVazioPlanejamento}>
                    <FontAwesome5 name="utensils" size={24} color="#ccc" style={style.margemInferiorIcone} />
                    <Text style={style.estadoVazioTexto}>Nenhuma refeição planejada.</Text>
                </View>
            )}
        </View>
    );
}