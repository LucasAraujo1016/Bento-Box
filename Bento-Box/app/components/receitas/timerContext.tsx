import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';
import { Vibration } from 'react-native';
import { useAudioPlayer } from 'expo-audio';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface TimerEntry {
    id: string;               // único: `${receitaId}_passo_${indicePasso}`
    receitaNome: string;
    indicePasso: number;
    totalSegundos: number;
    segundosRestantes: number;
    rodando: boolean;
    finalizado: boolean;
}

interface TimerContextValue {
    timers: TimerEntry[];
    iniciarTimer: (id: string, receitaNome: string, indicePasso: number, minutos: number) => void;
    pausarResumir: (id: string) => void;
    resetarTimer: (id: string) => void;
    removerTimer: (id: string) => void;
}

// ─── Contexto ─────────────────────────────────────────────────────────────────

const TimerContext = createContext<TimerContextValue>({
    timers: [],
    iniciarTimer: () => {},
    pausarResumir: () => {},
    resetarTimer: () => {},
    removerTimer: () => {},
});

export const useTimers = () => useContext(TimerContext);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function TimerProvider({ children }: { children: React.ReactNode }) {
    const [timers, setTimers] = useState<TimerEntry[]>([]);
    const intervaloRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // expo-audio: useAudioPlayer recebe a fonte do áudio.
    // Usamos o arquivo de beep local — coloque "timerBeep.mp3" em assets/sounds/.
    const player = useAudioPlayer(require('../../../assets/sounds/timerBeep.mp3'));

    const dispararFim = useCallback(() => {
        // 1) Vibração
        Vibration.vibrate([400, 200, 400, 200, 400]);

        // 2) Som — reposiciona no início e toca
        try {
            player.seekTo(0);
            player.play();
        } catch (e) {
            console.warn('Timer: erro ao tocar beep:', e);
        }
    }, [player]);

    // Tick global — um único setInterval para todos os timers
    useEffect(() => {
        intervaloRef.current = setInterval(() => {
            setTimers(prev => {
                let algumFinalizouAgora = false;

                const atualizados = prev.map(t => {
                    if (!t.rodando || t.finalizado) return t;

                    const novoSeg = t.segundosRestantes - 1;

                    if (novoSeg <= 0) {
                        algumFinalizouAgora = true;
                        return { ...t, segundosRestantes: 0, rodando: false, finalizado: true };
                    }

                    return { ...t, segundosRestantes: novoSeg };
                });

                if (algumFinalizouAgora) dispararFim();

                return atualizados;
            });
        }, 1000);

        return () => {
            if (intervaloRef.current) clearInterval(intervaloRef.current);
        };
    }, [dispararFim]);

    // ── Ações ────────────────────────────────────────────────────────────────

    const iniciarTimer = useCallback((id: string, receitaNome: string, indicePasso: number, minutos: number) => {
        setTimers(prev => {
            const existe = prev.find(t => t.id === id);
            if (existe) {
                return prev.map(t => t.id === id
                    ? { ...t, segundosRestantes: minutos * 60, rodando: true, finalizado: false }
                    : t
                );
            }
            return [...prev, {
                id,
                receitaNome,
                indicePasso,
                totalSegundos: minutos * 60,
                segundosRestantes: minutos * 60,
                rodando: true,
                finalizado: false,
            }];
        });
    }, []);

    const pausarResumir = useCallback((id: string) => {
        setTimers(prev => prev.map(t =>
            t.id === id && !t.finalizado ? { ...t, rodando: !t.rodando } : t
        ));
    }, []);

    const resetarTimer = useCallback((id: string) => {
        setTimers(prev => prev.map(t =>
            t.id === id ? { ...t, segundosRestantes: t.totalSegundos, rodando: false, finalizado: false } : t
        ));
    }, []);

    const removerTimer = useCallback((id: string) => {
        setTimers(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <TimerContext.Provider value={{ timers, iniciarTimer, pausarResumir, resetarTimer, removerTimer }}>
            {children}
        </TimerContext.Provider>
    );
}

// Export default vazio para o Expo Router não reclamar que a rota
// está sem default export — este arquivo NÃO é uma tela.
export default {};