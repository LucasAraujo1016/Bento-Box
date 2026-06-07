import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Animated,
    Dimensions,
} from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Conteúdo do tutorial ──────────────────────────────────────────────────────

const PASSOS = [
    {
        icone: 'utensils',
        cor: '#FF9D4D',
        titulo: 'Receitas',
        descricao:
            'Explore receitas de todos os tipos ou crie as suas próprias! Filtre por nível de habilidade, culinária e restrições alimentares. Marque como favorita ou registre no histórico quando cozinhar.',
        dica: 'Toque no card de uma receita para ver todos os detalhes e o passo a passo.',
    },
    {
        icone: 'calendar-alt',
        cor: '#4A90E2',
        titulo: 'Planejamento Semanal',
        descricao:
            'Monte seu cardápio da semana adicionando receitas a cada dia. Use o botão "Gerar planejamento" para receber sugestões automáticas baseadas no seu perfil. Salve seus planos e acesse quando quiser.',
        dica: 'Na tela do planejamento você gera a lista de compras com tudo que falta na sua despensa!',
    },
    {
        icone: 'box-open',
        cor: '#FF9D4D',
        titulo: 'Despensa',
        descricao:
            'Controle os ingredientes que você tem em casa. Adicione itens manualmente ou escaneie o código de barras dos produtos — o app identifica o item automaticamente e agrupa por tipo.',
        dica: 'Itens da sua despensa são riscados na lista de compras para você não comprar o que já tem.',
    },
    {
        icone: 'shopping-cart',
        cor: '#4CAF50',
        titulo: 'Lista de Compras',
        descricao:
            'Gerada automaticamente a partir do seu planejamento semanal, a lista de compras mostra tudo que você precisa comprar. Você pode compartilhá-la ou baixar em PDF.',
        dica: 'Toque em um item da lista para adicioná-lo diretamente à sua despensa.',
    },
    {
        icone: 'heart',
        cor: '#E53935',
        titulo: 'Favoritos & Histórico',
        descricao:
            'Salve suas receitas preferidas nos Favoritos e acompanhe tudo que já cozinhou no Histórico. As abas ficam no menu inferior para acesso rápido.',
        dica: 'No card de uma receita, toque no ícone de coração para favoritar ou no ícone de verificação para registrar como feita.',
    },
];

const STORAGE_KEY = 'tutorialConcluido';
const { width: SCREEN_W } = Dimensions.get('window');

// ─── Componente ───────────────────────────────────────────────────────────────

interface TutorialProps {
    /** Quando true, exibe o card compacto na Home; quando false, esconde */
    mostrarCard?: boolean;
}

export default function TutorialCard({ mostrarCard = true }: TutorialProps) {
    const [modalVisivel, setModalVisivel] = useState(false);
    const [passoAtual, setPassoAtual] = useState(0);
    const [concluido, setConcluido] = useState(false);

    // Animações
    const progressAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        AsyncStorage.getItem(STORAGE_KEY).then(val => {
            if (val === 'true') setConcluido(true);
        });
    }, []);

    // Anima a barra de progresso ao mudar de passo
    useEffect(() => {
        Animated.timing(progressAnim, {
            toValue: (passoAtual + 1) / PASSOS.length,
            duration: 350,
            useNativeDriver: false,
        }).start();
    });

    const animarTransicao = (direcao: 'avancar' | 'voltar', callback: () => void) => {
        const saida = direcao === 'avancar' ? -30 : 30;
        const entrada = direcao === 'avancar' ? 30 : -30;

        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: saida, duration: 150, useNativeDriver: true }),
        ]).start(() => {
            callback();
            slideAnim.setValue(entrada);
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
                Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
            ]).start();
        });
    };

    const avancar = () => {
        if (passoAtual < PASSOS.length - 1) {
            animarTransicao('avancar', () => setPassoAtual(p => p + 1));
        } else {
            concluirTutorial();
        }
    };

    const voltar = () => {
        if (passoAtual > 0) {
            animarTransicao('voltar', () => setPassoAtual(p => p - 1));
        }
    };

    const concluirTutorial = async () => {
        await AsyncStorage.setItem(STORAGE_KEY, 'true');
        setConcluido(true);
        setModalVisivel(false);
        setPassoAtual(0);
    };

    const reabrirTutorial = () => {
        setPassoAtual(0);
        setModalVisivel(true);
    };

    if (!mostrarCard) return null;

    const passo = PASSOS[passoAtual];
    const barraLargura = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    return (
        <>
            {/* ── Card compacto na Home ── */}
            <TouchableOpacity
                style={[styles.card, concluido && styles.cardConcluido]}
                onPress={reabrirTutorial}
                activeOpacity={0.85}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderEsquerda}>
                        <View style={[styles.iconeWrapper, concluido && styles.iconeWrapperConcluido]}>
                            <FontAwesome5
                                name={concluido ? 'check' : 'map-signs'}
                                size={18}
                                color={concluido ? '#4CAF50' : '#FF9D4D'}
                            />
                        </View>
                        <View>
                            <Text style={styles.cardTitulo}>
                                {concluido ? 'Tutorial concluído' : 'Como usar o Bento-Box'}
                            </Text>
                            <Text style={styles.cardSubtitulo}>
                                {concluido
                                    ? 'Toque para rever o guia quando quiser'
                                    : 'Guia rápido das principais funções'}
                            </Text>
                        </View>
                    </View>
                    <FontAwesome5 name="chevron-right" size={14} color="#bbb" />
                </View>

                {!concluido && (
                    <View style={styles.passinhoContainer}>
                        {PASSOS.map((p, i) => (
                            <View
                                key={i}
                                style={[styles.passinhoDot, { backgroundColor: p.cor, opacity: i === 0 ? 1 : 0.25 }]}
                            />
                        ))}
                        <Text style={styles.passinhoTexto}>{PASSOS.length} tópicos · ~2 min</Text>
                    </View>
                )}
            </TouchableOpacity>

            {/* ── Modal do tutorial ── */}
            <Modal visible={modalVisivel} transparent animationType="fade" onRequestClose={() => setModalVisivel(false)}>
                <View style={styles.overlay}>
                    <View style={styles.modalContainer}>

                        {/* Barra de progresso */}
                        <View style={styles.barraFundo}>
                            <Animated.View style={[styles.barraProgresso, { width: barraLargura, backgroundColor: passo.cor }]} />
                        </View>

                        {/* Contador */}
                        <Text style={styles.contador}>{passoAtual + 1} / {PASSOS.length}</Text>

                        {/* Conteúdo animado */}
                        <Animated.View
                            style={[
                                styles.conteudo,
                                { opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
                            ]}
                        >
                            {/* Ícone */}
                            <View style={[styles.iconeGrande, { backgroundColor: passo.cor + '20', borderColor: passo.cor + '40' }]}>
                                <FontAwesome5 name={passo.icone} size={36} color={passo.cor} />
                            </View>

                            {/* Título */}
                            <Text style={styles.tituloModal}>{passo.titulo}</Text>

                            {/* Descrição */}
                            <Text style={styles.descricaoModal}>{passo.descricao}</Text>

                            {/* Dica */}
                            <View style={[styles.dicaBox, { borderLeftColor: passo.cor }]}>
                                <FontAwesome5 name="lightbulb" size={13} color={passo.cor} solid style={{ marginRight: 8, marginTop: 1 }} />
                                <Text style={styles.dicaTexto}>{passo.dica}</Text>
                            </View>
                        </Animated.View>

                        {/* Dots de navegação */}
                        <View style={styles.dotsContainer}>
                            {PASSOS.map((_, i) => (
                                <TouchableOpacity
                                    key={i}
                                    onPress={() => {
                                        const dir = i > passoAtual ? 'avancar' : 'voltar';
                                        animarTransicao(dir, () => setPassoAtual(i));
                                    }}
                                    style={[
                                        styles.dot,
                                        i === passoAtual && { backgroundColor: passo.cor, width: 20 },
                                    ]}
                                />
                            ))}
                        </View>

                        {/* Botões */}
                        <View style={styles.botoesContainer}>
                            {passoAtual > 0 ? (
                                <TouchableOpacity style={styles.botaoVoltar} onPress={voltar}>
                                    <FontAwesome5 name="arrow-left" size={14} color="#666" />
                                    <Text style={styles.txtBotaoVoltar}>Anterior</Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity style={styles.botaoVoltar} onPress={() => setModalVisivel(false)}>
                                    <Text style={styles.txtBotaoVoltar}>Fechar</Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity
                                style={[styles.botaoAvancar, { backgroundColor: passo.cor }]}
                                onPress={avancar}
                            >
                                <Text style={styles.txtBotaoAvancar}>
                                    {passoAtual === PASSOS.length - 1 ? 'Concluir ✓' : 'Próximo'}
                                </Text>
                                {passoAtual < PASSOS.length - 1 && (
                                    <FontAwesome5 name="arrow-right" size={14} color="#fff" style={{ marginLeft: 6 }} />
                                )}
                            </TouchableOpacity>
                        </View>

                    </View>
                </View>
            </Modal>
        </>
    );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    // Card compacto
    card: {
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 16,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: '#FFF3E8',
    },
    cardConcluido: {
        borderColor: '#E8F5E9',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cardHeaderEsquerda: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    iconeWrapper: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#FFF3E8',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconeWrapperConcluido: {
        backgroundColor: '#E8F5E9',
    },
    cardTitulo: {
        fontSize: 15,
        fontWeight: '700',
        color: '#222',
    },
    cardSubtitulo: {
        fontSize: 13,
        color: '#888',
        marginTop: 2,
    },
    passinhoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        gap: 6,
    },
    passinhoDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    passinhoTexto: {
        fontSize: 12,
        color: '#aaa',
        marginLeft: 4,
    },

    // Modal
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.55)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderRadius: 20,
        width: '100%',
        maxWidth: 420,
        paddingTop: 0,
        paddingHorizontal: 24,
        paddingBottom: 24,
        overflow: 'hidden',
    },

    // Barra de progresso
    barraFundo: {
        height: 4,
        backgroundColor: '#f0f0f0',
        borderRadius: 2,
        marginBottom: 12,
        marginHorizontal: -24,
    },
    barraProgresso: {
        height: 4,
        borderRadius: 2,
    },

    contador: {
        fontSize: 12,
        color: '#bbb',
        textAlign: 'right',
        marginBottom: 8,
        fontWeight: '600',
    },

    // Conteúdo
    conteudo: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    iconeGrande: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    tituloModal: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1a1a1a',
        textAlign: 'center',
        marginBottom: 12,
    },
    descricaoModal: {
        fontSize: 15,
        color: '#555',
        textAlign: 'center',
        lineHeight: 23,
        marginBottom: 16,
    },
    dicaBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#fafafa',
        borderLeftWidth: 3,
        borderRadius: 8,
        padding: 12,
        width: '100%',
    },
    dicaTexto: {
        flex: 1,
        fontSize: 13,
        color: '#666',
        lineHeight: 19,
    },

    // Dots
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
        marginTop: 24,
        marginBottom: 20,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ddd',
    },

    // Botões
    botoesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
    },
    botaoVoltar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    txtBotaoVoltar: {
        color: '#888',
        fontSize: 15,
        fontWeight: '600',
    },
    botaoAvancar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
    },
    txtBotaoAvancar: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },
});