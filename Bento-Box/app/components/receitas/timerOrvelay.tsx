import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useTimers, TimerEntry } from './timerContext';

// Formata segundos em MM:SS
function formatarTempo(s: number): string {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const seg = (s % 60).toString().padStart(2, '0');
    return `${m}:${seg}`;
}

function corTimer(t: TimerEntry): string {
    if (t.finalizado) return '#E53935';
    if (t.segundosRestantes <= 30) return '#FF9D4D';
    return '#4CAF50';
}

/**
 * Overlay flutuante que exibe todos os timers ativos.
 * Renderizado uma única vez no topo da árvore (dentro de TimerProvider),
 * por isso persiste independentemente de qual tela/modal está aberto.
 */
export function TimerOverlay() {
    const { timers, pausarResumir, resetarTimer, removerTimer } = useTimers();

    // Só exibe se houver ao menos 1 timer registrado
    if (timers.length === 0) return null;

    return (
        <View style={styles.container} pointerEvents="box-none">
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={{ gap: 8 }}
                showsVerticalScrollIndicator={false}
                pointerEvents="box-none"
            >
                {timers.map(t => (
                    <View key={t.id} style={[styles.card, { borderLeftColor: corTimer(t) }]}>
                        {/* Cabeçalho do card */}
                        <View style={styles.cardHeader}>
                            <Text style={styles.receitaNome} numberOfLines={1}>
                                {t.receitaNome}
                            </Text>
                            <Pressable onPress={() => removerTimer(t.id)} hitSlop={8}>
                                <AntDesign name="close" size={14} color="#999" />
                            </Pressable>
                        </View>

                        {/* Passo + display */}
                        <View style={styles.cardBody}>
                            <Text style={styles.passLabel}>Passo {t.indicePasso + 1}</Text>
                            <Text style={[styles.display, { color: corTimer(t) }]}>
                                {t.finalizado ? '⏰ 00:00' : formatarTempo(t.segundosRestantes)}
                            </Text>

                            {/* Controles */}
                            <View style={styles.controles}>
                                {!t.finalizado && (
                                    <Pressable onPress={() => pausarResumir(t.id)} style={styles.btn} hitSlop={8}>
                                        <FontAwesome5
                                            name={t.rodando ? 'pause' : 'play'}
                                            size={11}
                                            color={corTimer(t)}
                                        />
                                    </Pressable>
                                )}
                                <Pressable onPress={() => resetarTimer(t.id)} style={styles.btn} hitSlop={8}>
                                    <FontAwesome5 name="redo-alt" size={11} color="#999" />
                                </Pressable>
                            </View>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    // Âncora no canto inferior direito, acima do footer
    container: {
        position: 'absolute',
        bottom: 80,      // altura aproximada do FooterCustomizado
        right: 12,
        zIndex: 9999,
        maxHeight: 320,
        width: 170,
    },
    scroll: {
        flexGrow: 0,
    },
    card: {
        backgroundColor: '#ffffffee',
        borderRadius: 12,
        borderLeftWidth: 4,
        paddingHorizontal: 10,
        paddingVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 6,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    receitaNome: {
        fontSize: 11,
        color: '#555',
        fontWeight: 'bold',
        flex: 1,
        marginRight: 6,
    },
    cardBody: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 6,
    },
    passLabel: {
        fontSize: 11,
        color: '#888',
    },
    display: {
        fontSize: 15,
        fontWeight: 'bold',
        fontVariant: ['tabular-nums'],
        minWidth: 46,
        textAlign: 'center',
    },
    controles: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },
    btn: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
// Export default vazio — este arquivo não é uma tela do Expo Router.
export default {};