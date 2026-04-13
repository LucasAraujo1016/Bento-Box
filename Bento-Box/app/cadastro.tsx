import { Component } from "react";
import { Text, TextInput, View, Pressable, ScrollView, Alert } from "react-native";
import { Picker } from '@react-native-picker/picker'
import style from "./styleSheet";
import { router } from "expo-router";

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
            const baseUrl = "http://localhost:3000";
            
            const urlDaSuaAPI = `${baseUrl}/api/cadastro`;  
            
            const resposta = await fetch(urlDaSuaAPI, {
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
            <ScrollView contentContainerStyle={{flexDirection: 'column', alignItems: 'center', gap: 50, paddingBottom: 50, paddingTop: 20}}>
                
                <Text style={{fontSize: 50, fontWeight: 'bold'}}>Novo Usuário</Text>
                
                <View style={{flexDirection: 'column', gap: 20, justifyContent: 'center', alignItems: 'center'}}>
                    <TextInput 
                        style={style.input_login} 
                        placeholder="Nome de Usuário"
                        value={this.state.nomeUsuario}
                        onChangeText={(t) => this.setState({ nomeUsuario: t })}
                    />
                    <TextInput 
                        style={style.input_login} 
                        placeholder="Email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={this.state.email}
                        onChangeText={(t) => this.setState({ email: t })}
                    />
                    <TextInput 
                        style={style.input_login} 
                        placeholder="Senha"
                        secureTextEntry
                        value={this.state.senha}
                        onChangeText={(t) => this.setState({ senha: t })}
                    />
                    
                    <View style={style.input_login}>
                        <Picker
                            selectedValue={this.state.culinariaFavorita}                            
                            onValueChange={(itemValue) => 
                                this.setState({culinariaFavorita: itemValue})
                            }
                        >
                            <Picker.Item label="Selecione sua culinária favorita" value="" />
                            <Picker.Item label="Japonesa" value="japonesa" />
                            <Picker.Item label="Italiana" value="italiana" />
                            <Picker.Item label="Brasileira" value="brasileira" />
                            <Picker.Item label="Mexicana" value="mexicana" />
                        </Picker>                
                    </View>
                    
                    <View style={style.input_login}>
                        <Picker
                            selectedValue={this.state.nivelDeHabilidade}
                            onValueChange={(itemValue) =>
                                this.setState({nivelDeHabilidade: itemValue})
                            }
                        >
                            <Picker.Item label="Selecione seu nivel de habilidade" value="" />
                            <Picker.Item label="Iniciante" value="iniciante" />
                            <Picker.Item label="Intermediario" value="intermediario" />
                            <Picker.Item label="Profissional" value="profissional" />
                        </Picker>
                    </View>

                    <Text style={{fontSize: 16, color: '#333'}}>Restrições (Selecione várias):</Text>
                    
                    <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', paddingHorizontal: 20}}>
                        {opcoesDeRestricao.map((item) => {
                            const estaSelecionado = this.state.restricoes.includes(item);

                            return (
                                <Pressable
                                    key={item}
                                    onPress={() => this.toggleRestricao(item)}
                                    style={{
                                        paddingHorizontal: 15,
                                        paddingVertical: 10,
                                        borderRadius: 20,
                                        borderWidth: 1,
                                        borderColor: '#007AFF',
                                        backgroundColor: estaSelecionado ? '#007AFF' : 'transparent', 
                                    }}
                                >
                                    <Text style={{ 
                                        color: estaSelecionado ? '#FFF' : '#007AFF', 
                                        fontWeight: 'bold'
                                    }}>
                                        {item}
                                    </Text>
                                </Pressable>
                            )
                        })}
                    </View>

                    <Pressable 
                        style={[style.login_button, this.state.carregando && { opacity: 0.5 }]} 
                        onPress={this.handleCadastro}
                        disabled={this.state.carregando}
                    >
                        <Text style={{fontSize: 25}}>
                            {this.state.carregando ? "Cadastrando..." : "Cadastrar"}
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>
        )
    }
}