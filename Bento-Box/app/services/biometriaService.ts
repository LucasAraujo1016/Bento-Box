import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Chaves usadas no AsyncStorage
const CHAVE_BIOMETRIA_ATIVA = 'biometriaAtiva';
const CHAVE_BIOMETRIA_EMAIL = 'biometriaEmail';
const CHAVE_BIOMETRIA_SENHA = 'biometriaSenha';

/** Verifica se o hardware do aparelho suporta biometria e tem digital cadastrada */
export const hardwareSuportado = async (): Promise<boolean> => {
    const compativel = await LocalAuthentication.hasHardwareAsync();
    const registrada = await LocalAuthentication.isEnrolledAsync();
    return compativel && registrada;
};

/** Lê do storage se a biometria está ativa para esta conta */
export const biometriaEstaAtiva = async (): Promise<boolean> => {
    const valor = await AsyncStorage.getItem(CHAVE_BIOMETRIA_ATIVA);
    return valor === 'true';
};

/**
 * Ativa a biometria: pede confirmação da digital e salva as credenciais no storage.
 * Retorna true se o usuário autenticou com sucesso, false caso contrário.
 */
export const ativarBiometria = async (email: string, senha: string): Promise<boolean> => {
    const suportado = await hardwareSuportado();
    if (!suportado) return false;

    const resultado = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Confirme sua digital para ativar o acesso biométrico',
        cancelLabel: 'Cancelar',
        fallbackLabel: 'Usar senha',
    });

    if (!resultado.success) return false;

    await AsyncStorage.setItem(CHAVE_BIOMETRIA_ATIVA, 'true');
    await AsyncStorage.setItem(CHAVE_BIOMETRIA_EMAIL, email);
    await AsyncStorage.setItem(CHAVE_BIOMETRIA_SENHA, senha);
    return true;
};

/** Desativa a biometria e limpa todas as credenciais salvas */
export const desativarBiometria = async (): Promise<void> => {
    await AsyncStorage.multiRemove([
        CHAVE_BIOMETRIA_ATIVA,
        CHAVE_BIOMETRIA_EMAIL,
        CHAVE_BIOMETRIA_SENHA,
    ]);
};

/**
 * Abre o prompt de digital e retorna as credenciais salvas se bem-sucedido.
 * Retorna null se a autenticação falhar ou não houver credenciais salvas.
 */
export const autenticarComDigital = async (): Promise<{ email: string; senha: string } | null> => {
    const ativa = await biometriaEstaAtiva();
    if (!ativa) return null;

    const resultado = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Use sua digital para entrar',
        cancelLabel: 'Cancelar',
        fallbackLabel: 'Usar senha',
    });

    if (!resultado.success) return null;

    const email = await AsyncStorage.getItem(CHAVE_BIOMETRIA_EMAIL);
    const senha = await AsyncStorage.getItem(CHAVE_BIOMETRIA_SENHA);

    if (!email || !senha) return null;
    return { email, senha };
};