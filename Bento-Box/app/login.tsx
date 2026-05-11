import { Component } from "react";
import { Image, Pressable, Text, TextInput, View, Alert, TouchableOpacity, ScrollView } from "react-native";
import style from "./styleSheet";
import { Link, router } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Feather from '@expo/vector-icons/Feather';

export default class Login extends Component {
    state = {
        email: "",
        senha: "",
        carregando: false,
        mostrarSenha: false
    };

    handleLogin = async () => {
        const { email, senha } = this.state;

        if (!email || !senha) {
            Alert.alert("Erro", "E-mail e senha são obrigatórios.");
            return;
        }

        this.setState({ carregando: true });

        try {            
            const baseUrl = "http://localhost:3000";
            
            const urlDaSuaAPI = `${baseUrl}/api/login`;          
            const resposta = await fetch(urlDaSuaAPI, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    senha: senha
                })
            });

            const dados = await resposta.json();

            if (resposta.ok) {
                console.log("Token recebido:", dados.token);
                await AsyncStorage.setItem('usuarioId', dados.usuario.id);
                await AsyncStorage.setItem('usuarioNome', dados.usuario.nome);
                router.replace('/home'); 
            } else {
                Alert.alert("Erro no Login", dados.erro || "Verifique suas credenciais");
            }
        } catch (erro) {
            console.error("Erro na requisição:", erro);
            Alert.alert("Erro", "Não foi possível conectar ao servidor");
        } finally {
            this.setState({ carregando: false });
        }
    };

    toggleMostrarSenha = () => {
        this.setState((prev: any) => ({ mostrarSenha: !prev.mostrarSenha }));
    }

    render (){
        return (
            /* ScrollView com flexGrow garante a rolagem apenas quando necessário */
            <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}>
                
                {/* Mantivemos sua margem e alinhamentos originais */}
                <View style={{flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 50, marginTop: 100}}>
                    
                    <View style={{flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                        <Image source={require('../assets/images/logo.png')} style={{width: 250, height: 250, justifyContent: "center", alignItems: 'center'}} />
                        <Text style={{fontSize: 50, fontWeight: 'bold'}}>Bento-Box</Text>
                    </View>

                    <View style={{flexDirection: 'column', gap: 20}}>
                        {/* E-mail re-estilizado em View separada e moderna */}
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

                        {/* Senha com olhinho adicionado mantendo as medidas do style.input_login */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#D9D9D9', width: 302, height: 58, borderRadius: 10, paddingHorizontal: 15 }}>
                            <Feather name="lock" size={20} color="#666" style={{ marginRight: 10 }} />
                            <TextInput 
                                style={{ flex: 1, fontSize: 16, fontWeight: 'bold' }} 
                                placeholder="Senha"
                                value={this.state.senha}
                                onChangeText={(texto) => this.setState({ senha: texto })}
                                secureTextEntry={!this.state.mostrarSenha}
                            />
                            <TouchableOpacity onPress={this.toggleMostrarSenha} style={{ padding: 5 }}>
                                <Feather 
                                    name={this.state.mostrarSenha ? "eye" : "eye-off"} 
                                    size={22} 
                                    color="#666" 
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={{flexDirection: 'column', gap: 20}}>
                        <Pressable 
                            style={[style.login_button, this.state.carregando && { opacity: 0.5 }]} 
                            onPress={this.handleLogin}
                            disabled={this.state.carregando}
                        >
                            <Text style={{fontSize: 25, fontWeight: 'bold'}}>
                                {this.state.carregando ? "Entrando..." : "Entrar"}
                            </Text>
                        </Pressable>
                        <Link href="/cadastro" asChild>
                            <Pressable style={style.login_button}>
                                <Text style={{fontSize: 25, fontWeight: 'bold'}}>Cadastrar</Text>
                            </Pressable>
                        </Link>
                    </View>
                </View>
            </ScrollView>
        )
    }
}