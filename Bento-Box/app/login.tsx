import { Component } from "react";
import { Image, Pressable, Text, TextInput, View, Alert, TouchableOpacity, ScrollView } from "react-native";
import style from "./styleSheet";
import { Link, router } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Feather from '@expo/vector-icons/Feather';
import {
    biometriaEstaAtiva,
    autenticarComDigital,
    hardwareSuportado,
} from './services/biometriaService';
import { API_BASE_URL } from "./constants/api";

export default class Login extends Component {
    state = {
        email: "",
        senha: "",
        carregando: false,
        mostrarSenha: false,
        mostrarBotaoBiometria: false,
    };

    async componentDidMount() {
        try {
            const ativa = await biometriaEstaAtiva();
            this.setState({ mostrarBotaoBiometria: ativa });
        } catch (e) {
            console.warn('Erro ao verificar biometria:', e);
        }
    }

    // ─── Login normal (email + senha) ─────────────────────────────────────────
    handleLogin = async () => {
        const { email, senha } = this.state;

        if (!email || !senha) {
            Alert.alert("Erro", "E-mail e senha são obrigatórios.");
            return;
        }

        this.setState({ carregando: true });

        try {
            const sucesso = await this.fazerRequisicaoLogin(email, senha);

            if (sucesso) {
                // Salva credenciais para o perfil poder ativar biometria
                await AsyncStorage.setItem('loginEmail', email);
                await AsyncStorage.setItem('loginSenha', senha);

                await this.oferecerBiometriaSeDisponivel();
            }
        } finally {
            this.setState({ carregando: false });
        }
    };

    // ─── Login biométrico ──────────────────────────────────────────────────────
    handleLoginBiometrico = async () => {
        this.setState({ carregando: true });
        try {
            const credenciais = await autenticarComDigital();
            if (!credenciais) return;
            await this.fazerRequisicaoLogin(credenciais.email, credenciais.senha);
        } catch {
            Alert.alert("Erro", "Não foi possível autenticar com a digital.");
        } finally {
            this.setState({ carregando: false });
        }
    };

    // ─── Lógica central de login ───────────────────────────────────────────────
    fazerRequisicaoLogin = async (email: string, senha: string): Promise<boolean> => {
        try {
            const resposta = await fetch(`${API_BASE_URL}/api/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, senha }),
            });

            const dados = await resposta.json();

            if (resposta.ok) {
                await AsyncStorage.setItem('usuarioId', dados.usuario.id);
                await AsyncStorage.setItem('usuarioNome', dados.usuario.nome);
                router.replace('/home');
                return true;
            } else {
                Alert.alert("Erro no Login", dados.erro || "Verifique suas credenciais");
                return false;
            }
        } catch (erro) {
            console.error("Erro na requisição:", erro);
            Alert.alert("Erro", "Não foi possível conectar ao servidor");
            return false;
        }
    };

    // Avisa o usuário sobre a possibilidade de ativar biometria no perfil
    oferecerBiometriaSeDisponivel = async () => {
        try {
            const jáAtiva = await biometriaEstaAtiva();
            if (jáAtiva) return;

            const suportado = await hardwareSuportado();
            if (!suportado) return;

            setTimeout(() => {
                Alert.alert(
                    "Ativar login por digital?",
                    "Você pode ativar o acesso por digital nas configurações do seu perfil.",
                    [{ text: "Entendi" }]
                );
            }, 800);
        } catch {
            // Silencioso — não bloqueia o login
        }
    };

    toggleMostrarSenha = () => {
        this.setState((prev: any) => ({ mostrarSenha: !prev.mostrarSenha }));
    };

    render() {
        const { carregando, mostrarSenha, mostrarBotaoBiometria } = this.state;

        return (
            <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}>
                <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 50, marginTop: 100 }}>

                    {/* Logo */}
                    <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                        <Image source={require('../assets/images/logo.png')} style={{ width: 250, height: 250, justifyContent: "center", alignItems: 'center' }} />
                        <Text style={{ fontSize: 50, fontWeight: 'bold' }}>Bento-Box</Text>
                    </View>

                    {/* Campos */}
                    <View style={{ flexDirection: 'column', gap: 20 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#D9D9D9', width: 302, height: 58, borderRadius: 10, paddingHorizontal: 15 }}>
                            <Feather name="mail" size={20} color="#666" style={{ marginRight: 10 }} />
                            <TextInput
                                style={{ flex: 1, fontSize: 16, fontWeight: 'bold' }}
                                placeholder="E-mail"
                                value={this.state.email}
                                onChangeText={(texto) => this.setState({ email: texto })}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#D9D9D9', width: 302, height: 58, borderRadius: 10, paddingHorizontal: 15 }}>
                            <Feather name="lock" size={20} color="#666" style={{ marginRight: 10 }} />
                            <TextInput
                                style={{ flex: 1, fontSize: 16, fontWeight: 'bold' }}
                                placeholder="Senha"
                                value={this.state.senha}
                                onChangeText={(texto) => this.setState({ senha: texto })}
                                secureTextEntry={!mostrarSenha}
                            />
                            <TouchableOpacity onPress={this.toggleMostrarSenha} style={{ padding: 5 }}>
                                <Feather name={mostrarSenha ? "eye" : "eye-off"} size={22} color="#666" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Botões */}
                    <View style={{ flexDirection: 'column', gap: 20, alignItems: 'center' }}>
                        <Pressable
                            style={[style.login_button, carregando && { opacity: 0.5 }]}
                            onPress={this.handleLogin}
                            disabled={carregando}
                        >
                            <Text style={{ fontSize: 25, fontWeight: 'bold' }}>
                                {carregando ? "Entrando..." : "Entrar"}
                            </Text>
                        </Pressable>

                        <Link href="/cadastro" asChild>
                            <Pressable style={style.login_button}>
                                <Text style={{ fontSize: 25, fontWeight: 'bold' }}>Cadastrar</Text>
                            </Pressable>
                        </Link>

                        {/* Botão de digital — aparece sempre que a biometria estiver ativa no storage */}
                        {mostrarBotaoBiometria && (
                            <TouchableOpacity
                                onPress={this.handleLoginBiometrico}
                                disabled={carregando}
                                style={{
                                    marginTop: 10,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 64,
                                    height: 64,
                                    borderRadius: 32,
                                    backgroundColor: '#FFF3E8',
                                    borderWidth: 2,
                                    borderColor: '#FF9D4D',
                                    opacity: carregando ? 0.5 : 1,
                                }}
                            >
                                <Feather name="aperture" size={30} color="#FF9D4D" />
                            </TouchableOpacity>
                        )}
                    </View>

                </View>
            </ScrollView>
        );
    }
}