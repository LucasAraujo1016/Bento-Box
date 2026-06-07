import { Component } from "react";
import { Text, TextInput, View, Pressable, ScrollView, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { Picker } from '@react-native-picker/picker';
import style from "./styleSheet";
import { router } from "expo-router";
import { API_BASE_URL } from "./constants/api";

interface State {
    nomeUsuario: string; 
    email: string;       
    senha: string;       
    culinariaFavorita: string;
    nivelDeHabilidade: string;
    restricoes: string[]; 
    carregando: boolean; 
}

export default class cadastro extends Component<any, State> {
    state: State = {
        nomeUsuario: "", 
        email: "",       
        senha: "",       
        culinariaFavorita: "",
        nivelDeHabilidade: "",
        restricoes: [],
        carregando: false
    }    

    toggleRestricao = (itemDaVez: string) => {
        const listaAtual = this.state.restricoes;
        
        if (listaAtual.includes(itemDaVez)) {
            this.setState({ 
                restricoes: listaAtual.filter(item => item !== itemDaVez) 
            });
        } else {
            this.setState({ 
                restricoes: [...listaAtual, itemDaVez] 
            });
        }
    }

    handleCadastro = async () => {
        const { nomeUsuario, email, senha, culinariaFavorita, nivelDeHabilidade, restricoes } = this.state;

        if (!nomeUsuario || !email || !senha) {
            Alert.alert("Erro", "Nome, e-mail e senha são obrigatórios!");
            return;
        }

        this.setState({ carregando: true });

        try {            
            const resposta = await fetch(`${API_BASE_URL}/api/cadastro`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: email,
                    senha: senha,
                    nomeUsuario: nomeUsuario,
                    culinariaFavorita: culinariaFavorita,
                    nivelHabilidade: nivelDeHabilidade,
                    restricoes: restricoes
                })
            });

            const dados = await resposta.json();

            if (resposta.ok) {
                Alert.alert("Sucesso!", "Cadastro realizado com sucesso.", [
                    { text: "OK", onPress: () => router.replace('/login') }
                ]);
            } else {
                Alert.alert("Erro no Cadastro", dados.erro || "Ocorreu um problema.");
            }
        } catch (erro) {
            console.error("Erro no fetch:", erro);
            Alert.alert("Erro", "Falha ao se comunicar com o servidor.");
        } finally {
            this.setState({ carregando: false });
        }
    }

    render (){
        const opcoesDeRestricao = ["Vegetariano", "Vegano", "Intolerante a Lactose", "Alérgico a Amendoim", "Alérgico a frutos do mar","Sem Glúten"];

        return (
            <KeyboardAvoidingView 
                style={{ flex: 1, backgroundColor: '#FFFFFF' }} 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <ScrollView contentContainerStyle={style.scrollContainerCadastro}>
                    
                    <View style={style.cabecalhoCadastro}>
                        <Text style={style.tituloCadastro}>Criar Conta</Text>
                        <Text style={style.subtituloCadastro}>Preencha seus dados para começar a planejar suas refeições com o Bento-Box!</Text>
                    </View>
                    
                    <View style={style.formContainerCadastro}>
                        <Text style={style.labelCadastro}>Nome Completo</Text>
                        <TextInput 
                            style={style.inputFormCadastro} 
                            placeholder="Ex: João da Silva"
                            placeholderTextColor="#999"
                            value={this.state.nomeUsuario}
                            onChangeText={(t) => this.setState({ nomeUsuario: t })}
                        />

                        <Text style={style.labelCadastro}>E-mail</Text>
                        <TextInput 
                            style={style.inputFormCadastro} 
                            placeholder="seu@email.com"
                            placeholderTextColor="#999"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={this.state.email}
                            onChangeText={(t) => this.setState({ email: t })}
                        />

                        <Text style={style.labelCadastro}>Senha</Text>
                        <TextInput 
                            style={style.inputFormCadastro} 
                            placeholder="Crie uma senha segura"
                            placeholderTextColor="#999"
                            secureTextEntry
                            value={this.state.senha}
                            onChangeText={(t) => this.setState({ senha: t })}
                        />
                        
                        <Text style={style.labelCadastro}>Culinária Favorita</Text>
                        <View style={style.pickerWrapperCadastro}>
                            <Picker
                                selectedValue={this.state.culinariaFavorita}                            
                                onValueChange={(itemValue) => 
                                    this.setState({culinariaFavorita: itemValue})
                                }
                                style={style.pickerBaseCadastro}
                            >
                                <Picker.Item label="Selecione sua culinária favorita" value="" color="#999" />
                                <Picker.Item label="Japonesa" value="japonesa" />
                                <Picker.Item label="Italiana" value="italiana" />
                                <Picker.Item label="Brasileira" value="brasileira" />
                                <Picker.Item label="Mexicana" value="mexicana" />
                            </Picker>                
                        </View>
                        
                        <Text style={style.labelCadastro}>Nível de Habilidade</Text>
                        <View style={style.pickerWrapperCadastro}>
                            <Picker
                                selectedValue={this.state.nivelDeHabilidade}
                                onValueChange={(itemValue) =>
                                    this.setState({nivelDeHabilidade: itemValue})
                                }
                                style={style.pickerBaseCadastro}
                            >
                                <Picker.Item label="Selecione seu nível de habilidade" value="" color="#999" />
                                <Picker.Item label="Iniciante" value="iniciante" />
                                <Picker.Item label="Intermediário" value="intermediario" />
                                <Picker.Item label="Profissional" value="profissional" />
                            </Picker>
                        </View>

                        <Text style={[style.labelCadastro, { marginTop: 25 }]}>Possui alguma restrição alimentar?</Text>
                        
                        <View style={style.tagsContainerCadastro}>
                            {opcoesDeRestricao.map((item) => {
                                const estaSelecionado = this.state.restricoes.includes(item);

                                return (
                                    <Pressable
                                        key={item}
                                        onPress={() => this.toggleRestricao(item)}
                                        style={[
                                            style.tagRestricao, 
                                            estaSelecionado && style.tagRestricaoAtiva
                                        ]}
                                    >
                                        <Text style={[
                                            style.tagRestricaoTexto,
                                            estaSelecionado && style.tagRestricaoTextoAtiva
                                        ]}>
                                            {item}
                                        </Text>
                                    </Pressable>
                                )
                            })}
                        </View>

                        <Pressable 
                            style={[style.botaoSubmitCadastro, this.state.carregando && { opacity: 0.7 }]} 
                            onPress={this.handleCadastro}
                            disabled={this.state.carregando}
                        >
                            <Text style={style.botaoSubmitTextCadastro}>
                                {this.state.carregando ? "Criando conta..." : "Cadastrar"}
                            </Text>
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        )
    }
}