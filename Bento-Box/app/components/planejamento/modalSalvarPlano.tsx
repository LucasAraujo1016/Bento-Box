import React from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput } from 'react-native';
import style from '../../styleSheet';

interface ModalSalvarPlanoProps {
    visible: boolean;
    nomeTemporario: string;
    onNomeChange: (text: string) => void;
    onCancelar: () => void;
    onSalvar: () => void;
}

export default function ModalSalvarPlano({ visible, nomeTemporario, onNomeChange, onCancelar, onSalvar }: ModalSalvarPlanoProps) {
    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View style={style.modalContainer}>
                <View style={style.modalCard}>
                    <Text style={style.modalTitulo}>Salvar Planejamento</Text>
                    <Text style={style.label}>Nome do Planejamento:</Text>
                    <TextInput 
                        style={style.modalInput} 
                        value={nomeTemporario}
                        onChangeText={onNomeChange}
                        placeholder="Digite um título..."
                    />
                    <View style={style.modalBotoes}>
                        <TouchableOpacity style={[style.modalBotao, style.modalBotaoCancelar]} onPress={onCancelar}>
                            <Text style={style.modalTextoBotao}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[style.modalBotao, style.modalBotaoSalvar]} onPress={onSalvar}>
                            <Text style={style.modalTextoBotao}>Salvar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}