import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Pressable } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import style from '../../styleSheet';
import { ReceitaItem } from '../receitas/receitaCard';

interface ModalOpcoesDiaProps {
    visible: boolean;
    diaParaAdicionar: string | null;
    sugestoesFiltradas: ReceitaItem[];
    temSugestoesTotais: boolean;
    buscandoSugestoes: boolean;
    onClose: () => void;
    onAdicionarReceita: (receita: ReceitaItem) => void;
}

export default function ModalOpcoesDia({ 
    visible, 
    diaParaAdicionar, 
    sugestoesFiltradas, 
    temSugestoesTotais, 
    buscandoSugestoes, 
    onClose, 
    onAdicionarReceita 
}: ModalOpcoesDiaProps) {
    return (
        <Modal visible={visible} animationType="fade" transparent={true}>
            <View style={style.modalContainer}>
                <View style={[style.modalCard, style.modalCardGrande]}>
                    <View style={style.modalHeaderBox}>
                        <Text style={style.modalTitulo}>Opções para: {diaParaAdicionar}</Text>
                        <Pressable onPress={onClose}>
                            <FontAwesome5 name="times" size={24} color="#333" />
                        </Pressable>
                    </View>
                    <ScrollView>
                        {sugestoesFiltradas.map((rec, i) => (
                            <TouchableOpacity key={i} style={[style.refeicaoItem, style.itemSugestaoReceita]} onPress={() => onAdicionarReceita(rec)}>
                                <Text style={style.nomeRefeicao}>{rec.nome}</Text>
                                <FontAwesome5 name="plus" color="#4A90E2" size={14}/>
                            </TouchableOpacity>
                        ))}
                        {sugestoesFiltradas.length === 0 && temSugestoesTotais && (
                            <Text style={style.textoMensagemVazia}>Você já adicionou todas as receitas disponíveis para seu perfil neste dia!</Text>
                        )}
                        {!temSugestoesTotais && buscandoSugestoes && (
                            <Text style={style.textoMensagemVazia}>Buscando receitas...</Text>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}