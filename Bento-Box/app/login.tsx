import { Component } from "react";
import { Image, Pressable, Text, TextInput, View, Alert } from "react-native";
import style from "./styleSheet";
import { Link, router } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class Login extends Component {
    state = {
        email: "",
        senha: "",
        carregando: false
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

    render (){
        return (
            <View style={{flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 50}}>
                <View style={{flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                    <Image source={require('../assets/images/logo.png')} style={{width: 250, height: 250, justifyContent: "center", alignItems: 'center'}} />
                    <Text style={{fontSize: 50, fontWeight: 'bold'}}>Bento-Box</Text>
                </View>
                <View style={{flexDirection: 'column', gap: 20}}>
                    <TextInput 
                        style={style.input_login} 
                        placeholder="E-mail"
                        value={this.state.email}
                        onChangeText={(texto) => this.setState({ email: texto })}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <TextInput 
                        style={style.input_login} 
                        placeholder="Senha"
                        value={this.state.senha}
                        onChangeText={(texto) => this.setState({ senha: texto })}
                        secureTextEntry={true}
                    />
                </View>
                <View style={{flexDirection: 'column', gap: 20}}>
                    <Pressable 
                        style={[style.login_button, this.state.carregando && { opacity: 0.5 }]} 
                        onPress={this.handleLogin}
                        disabled={this.state.carregando}
                    >
                        <Text style={{fontSize: 25}}>
                            {this.state.carregando ? "Entrando..." : "Entrar"}
                        </Text>
                    </Pressable>
                    <Link href="/cadastro" asChild>
                        <Pressable style={style.login_button}>
                            <Text style={{fontSize: 25}}>Cadastrar</Text>
                        </Pressable>
                    </Link>
                </View>
            </View>
        )
    }
}