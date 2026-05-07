import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Pressable } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import style from '../../styleSheet';

interface ModalMeusPlanosProps {
    visible: boolean;
    planosSalvos: any[];
    onClose: () => void;
    onSelecionarPlano: (plano: any) => void;
    onExcluirPlano: (id: string, nome: string) => void;
}

export default function ModalMeusPlanos({ visible, planosSalvos, onClose, onSelecionarPlano, onExcluirPlano }: ModalMeusPlanosProps) {
    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View style={style.modalContainer}>
                <View style={[style.modalCard, style.modalCardGrande]}>
                    <View style={style.modalHeaderBox}>
                        <Text style={style.modalTitulo}>Meus Planejamentos</Text>
                        <Pressable onPress={onClose}>
                            <FontAwesome5 name="times" size={24} color="#333" />
                        </Pressable>
                    </View>
                    <ScrollView>
                        {planosSalvos.map((plano) => (
                            <TouchableOpacity 
                                key={plano._id} 
                                style={[style.refeicaoItem, style.itemListaModal]}
                                onPress={() => onSelecionarPlano(plano)}
                            >
                                <View style={style.flexInfo}>
                                    <Text style={style.nomeRefeicao}>{plano.nome}</Text>
                                    <Text style={style.dataPlanoModal}>Ativo/Criado em: {new Date(plano.atualizacaoDts).toLocaleDateString('pt-BR')}</Text>
                                </View>
                                <Pressable style={style.btnExcluirPlanoPad} onPress={(e) => { e.stopPropagation(); onExcluirPlano(plano._id, plano.nome); }}>
                                    <FontAwesome5 name="trash" size={18} color="#FF5252" />
                                </Pressable>
                            </TouchableOpacity>
                        ))}
                        {planosSalvos.length === 0 && (
                            <Text style={style.textoMensagemVazia}>Nenhum planejamento salvo.</Text>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}