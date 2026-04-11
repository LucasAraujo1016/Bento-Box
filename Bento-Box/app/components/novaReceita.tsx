import { Component } from "react";
import { View, ScrollView, Text, TextInput, Pressable, Modal, Image, Alert } from "react-native";
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import AntDesign from '@expo/vector-icons/AntDesign';
import style from "../styleSheet";

interface Props {
    visible: boolean;
    onClose: () => void;
}

interface State {
    nome: string;
    imagem: string | null;
    descricao: string;
    tempoPreparo: string;
    nivelHabilidade: string;
    tipoCulinaria: string;
    restricoes: string[];
    ingredientes: Ingrediente[];
    modoPreparo: string[];
    
    isAddingIngrediente: boolean;
    novoIngredienteNome: string;
    novoIngredienteQuantidade: string;
    novoIngredienteUnidade: string;
    
    indexEdicaoIngrediente: number | null;
    edicaoIngredienteNome: string;
    edicaoIngredienteQuantidade: string;
    edicaoIngredienteUnidade: string;

    isAddingModo: boolean;
    novoModo: string;
    indexEdicaoModo: number | null;
    textoEdicaoModo: string;
}

interface Ingrediente {
    nome: string;
    quantidade: string;
    unidade: string;
}

export default class NovaReceita extends Component<Props, State> {
    state: State = {
        nome: '',
        imagem: null,
        descricao: '',
        tempoPreparo: '',
        nivelHabilidade: '',
        tipoCulinaria: '',
        restricoes: [],
        ingredientes: [],
        modoPreparo: [],
        isAddingIngrediente: false,
        novoIngredienteNome: '',
        novoIngredienteQuantidade: '',
        novoIngredienteUnidade: 'unidades',
        indexEdicaoIngrediente: null,
        edicaoIngredienteNome: '',
        edicaoIngredienteQuantidade: '',
        edicaoIngredienteUnidade: 'unidades',
        isAddingModo: false,
        novoModo: '',
        indexEdicaoModo: null,
        textoEdicaoModo: '',
    };

    componentDidUpdate(prevProps: Props) {
        if (!prevProps.visible && this.props.visible) {
            this.resetarFormulario();
        }
    }

    resetarFormulario = () => {
        this.setState({
            nome: '',
            imagem: null,
            descricao: '',
            tempoPreparo: '',
            nivelHabilidade: '',
            tipoCulinaria: '',
            restricoes: [],
            ingredientes: [],
            modoPreparo: [],
            isAddingIngrediente: false,
            novoIngredienteNome: '',
            novoIngredienteQuantidade: '',
            novoIngredienteUnidade: 'unidades',
            indexEdicaoIngrediente: null,
            edicaoIngredienteNome: '',
            edicaoIngredienteQuantidade: '',
            edicaoIngredienteUnidade: 'unidades',
            isAddingModo: false,
            novoModo: '',
            indexEdicaoModo: null,
            textoEdicaoModo: '',
        });
    }

    selecionarImagem = () => {
        Alert.alert(
            "Selecionar Imagem",
            "Escolha como deseja adicionar a foto da receita:",
            [
                { text: "Cancelar", style: "cancel" },
                { text: "Tirar Foto", onPress: this.abrirCamera },
                { text: "Escolher da Galeria", onPress: this.abrirGaleria }
            ]
        );
    };

    abrirGaleria = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: false, 
            quality: 1,
        });

        if (!result.canceled) {
            this.setState({ imagem: result.assets[0].uri });
        }
    };

    abrirCamera = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert("Permissão Negada", "Precisamos de permissão para acessar a câmera.");
            return;
        }

        let result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: false,
            quality: 1,
        });

        if (!result.canceled) {
            this.setState({ imagem: result.assets[0].uri });
        }
    };

    toggleRestricao = (itemDaVez: string) => {
        const listaAtual = this.state.restricoes;
        if (listaAtual.includes(itemDaVez)) {
            this.setState({ restricoes: listaAtual.filter(item => item !== itemDaVez) });
        } else {
            this.setState({ restricoes: [...listaAtual, itemDaVez] });
        }
    }

    validarFormatoIngrediente = (texto: string) => {
        if (!texto.includes('-')) {
            Alert.alert(
                "Formato Inválido", 
                "O ingrediente deve estar no formato: 'Nome - Quantidade'. \n\nExemplo: Ovos - 2 unidades"
            );
            return false;
        }
        return true;
    }

    salvarIngrediente = () => {
        const nome = this.state.novoIngredienteNome.trim();
        const quantidade = this.state.novoIngredienteQuantidade.trim();
        
        if (nome !== '' && quantidade !== '') {
            this.setState(prevState => ({
                ingredientes: [...prevState.ingredientes, { 
                    nome, 
                    quantidade, 
                    unidade: this.state.novoIngredienteUnidade 
                }],
                isAddingIngrediente: false,
                novoIngredienteNome: '',
                novoIngredienteQuantidade: '',
                novoIngredienteUnidade: 'unidades'
            }));
        } else {
            Alert.alert("Atenção", "Preencha o nome e a quantidade do ingrediente.");
        }
    }
    
    iniciarEdicaoIngrediente = (index: number) => {
        const item = this.state.ingredientes[index];
        this.setState({ 
            indexEdicaoIngrediente: index, 
            edicaoIngredienteNome: item.nome,
            edicaoIngredienteQuantidade: item.quantidade,
            edicaoIngredienteUnidade: item.unidade
        });
    }

    salvarEdicaoIngrediente = () => {
        const nome = this.state.edicaoIngredienteNome.trim();
        const quantidade = this.state.edicaoIngredienteQuantidade.trim();

        if (nome !== '' && quantidade !== '') {
            const listaAtualizada = [...this.state.ingredientes];
            listaAtualizada[this.state.indexEdicaoIngrediente as number] = { 
                nome, 
                quantidade, 
                unidade: this.state.edicaoIngredienteUnidade 
            };
            this.setState({ 
                ingredientes: listaAtualizada, 
                indexEdicaoIngrediente: null, 
                edicaoIngredienteNome: '',
                edicaoIngredienteQuantidade: '',
                edicaoIngredienteUnidade: 'unidades'
            });
        }
    }

    removerIngrediente = (index: number) => {
        const lista = [...this.state.ingredientes];
        lista.splice(index, 1);
        this.setState({ ingredientes: lista });
    }

    salvarModo = () => {
        const texto = this.state.novoModo.trim();
        if (texto !== '') {
            this.setState(prevState => ({
                modoPreparo: [...prevState.modoPreparo, texto],
                isAddingModo: false,
                novoModo: ''
            }));
        }
    }

    iniciarEdicaoModo = (index: number) => {
        this.setState({ 
            indexEdicaoModo: index, 
            textoEdicaoModo: this.state.modoPreparo[index] 
        });
    }

    salvarEdicaoModo = () => {
        const texto = this.state.textoEdicaoModo.trim();
        if (texto !== '') {
            const listaAtualizada = [...this.state.modoPreparo];
            listaAtualizada[this.state.indexEdicaoModo as number] = texto;
            this.setState({ 
                modoPreparo: listaAtualizada, 
                indexEdicaoModo: null, 
                textoEdicaoModo: '' 
            });
        }
    }
    
    removerModo = (index: number) => {
        const lista = [...this.state.modoPreparo];
        lista.splice(index, 1);
        this.setState({ modoPreparo: lista });
    }

    salvarReceita = async () => {
        if (!this.state.nome || !this.state.tempoPreparo || !this.state.nivelHabilidade || !this.state.tipoCulinaria) {
            Alert.alert("Atenção", "Preencha todos os campos obrigatórios (*).");
            return;
        }

        const tempoNumber = Number(this.state.tempoPreparo);
        if (isNaN(tempoNumber) || tempoNumber <= 0) {
            Alert.alert("Tempo Inválido", "O tempo de preparo deve ser um número válido e maior que zero.");
            return;
        }

        if (this.state.ingredientes.length === 0) {
            Alert.alert("Sem Ingredientes", "Adicione pelo menos 1 ingrediente.");
            return;
        }
        if (this.state.modoPreparo.length === 0) {
            Alert.alert("Sem Modo de Preparo", "Adicione pelo menos 1 passo no modo de preparo.");
            return;
        }

        if (this.state.isAddingIngrediente && (this.state.novoIngredienteNome.trim() !== '' || this.state.novoIngredienteQuantidade.trim() !== '')) {
            Alert.alert("Atenção", "Você esqueceu de confirmar o ingrediente que estava digitando.");
            return;
        }

        const ingredientesFormatados = this.state.ingredientes.map(item => {
            return {
                nome: item.nome,
                quantidade: `${item.quantidade} ${item.unidade}`
            };
        });

        const receitaNova = {
            autorId: "usuario-temporario-123", 
            nome: this.state.nome.trim(),
            imagem: this.state.imagem || "",
            descricao: this.state.descricao.trim(),
            tempoPreparo: tempoNumber, 
            nivelHabilidade: this.state.nivelHabilidade,
            tipoCulinaria: this.state.tipoCulinaria,
            restricoes: this.state.restricoes,
            ingredientes: ingredientesFormatados,
            modoPreparo: this.state.modoPreparo
        };

        try {
            const resposta = await fetch("http://localhost:3000/api/receitas", { 
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(receitaNova)
            });

            if (resposta.ok) {
                Alert.alert("Sucesso", "Receita postada com sucesso!");
                this.props.onClose(); 
            } else {
                const erro = await resposta.json();
                Alert.alert("Erro do Servidor", "Não foi possível salvar: " + erro.message);
            }
        } catch (error) {
            console.error("Erro ao enviar a receita: ", error);
            Alert.alert("Erro de Conexão", "Falha ao comunicar com o servidor.");
        }
    }

    render (){
        const opcoesDeRestricao = ["Vegetariano", "Vegano", "Intolerante a Lactose", "Alérgico a Amendoim", "Alérgico a frutos do mar", "Sem Glúten"];

        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={this.props.visible}
                onRequestClose={this.props.onClose}
            >
                <View style={style.modalContainer}>
                    <View style={[style.modalCard, { maxHeight: '90%' }]}>
                        <Text style={style.modalTitulo}>Criar Nova Receita</Text>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={style.label}>Imagem da Receita</Text>
                            <Pressable 
                                style={[style.modalInput, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#e0e0e0' }]} 
                                onPress={this.selecionarImagem}
                            >
                                {this.state.imagem ? (
                                    <Image source={{ uri: this.state.imagem }} style={{ width: '100%', height: 150, borderRadius: 8 }} />
                                ) : (
                                    <Text style={{ color: '#555' }}>Toque para selecionar uma imagem</Text>
                                )}
                            </Pressable>

                            <Text style={style.label}>Nome da Receita *</Text>
                            <TextInput style={style.modalInput} placeholder="Ex: Bolo de Cenoura" 
                                value={this.state.nome} onChangeText={(text) => this.setState({ nome: text })} />

                            <Text style={style.label}>Descrição *</Text>
                            <TextInput style={[style.modalInput, { height: 80 }]} placeholder="Breve descrição do prato" multiline={true}
                                value={this.state.descricao} onChangeText={(text) => this.setState({ descricao: text })} />

                            <Text style={style.label}>Tempo de Preparo (minutos) *</Text>
                            <TextInput style={style.modalInput} placeholder="Ex: 45" keyboardType="numeric"
                                value={this.state.tempoPreparo} onChangeText={(text) => this.setState({ tempoPreparo: text })} />

                            <Text style={style.label}>Nível de Habilidade *</Text>
                            <View style={[style.modalInput, { padding: 0, justifyContent: 'center' }]}> 
                                <Picker
                                    selectedValue={this.state.nivelHabilidade}
                                    onValueChange={(itemValue) => this.setState({nivelHabilidade: itemValue})}
                                >
                                    <Picker.Item label="Selecione..." value="" />
                                    <Picker.Item label="Iniciante" value="iniciante" />
                                    <Picker.Item label="Intermediário" value="intermediario" />
                                    <Picker.Item label="Profissional" value="profissional" />
                                </Picker>
                            </View>

                            <Text style={style.label}>Tipo de Culinária *</Text>
                            <View style={[style.modalInput, { padding: 0, justifyContent: 'center' }]}> 
                                <Picker
                                    selectedValue={this.state.tipoCulinaria}
                                    onValueChange={(itemValue) => this.setState({tipoCulinaria: itemValue})}
                                >
                                    <Picker.Item label="Selecione..." value="" />
                                    <Picker.Item label="Japonesa" value="japonesa" />
                                    <Picker.Item label="Italiana" value="italiana" />
                                    <Picker.Item label="Brasileira" value="brasileira" />
                                    <Picker.Item label="Mexicana" value="mexicana" />
                                </Picker>
                            </View>

                            <Text style={style.label}>Restrições</Text>
                            <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 15}}>
                                {opcoesDeRestricao.map((item) => {
                                    const estaSelecionado = this.state.restricoes.includes(item);
                                    return (
                                        <Pressable
                                            key={item}
                                            onPress={() => this.toggleRestricao(item)}
                                            style={{
                                                paddingHorizontal: 15, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#FF9D4D',
                                                backgroundColor: estaSelecionado ? '#FF9D4D' : 'transparent', 
                                            }}
                                        >
                                            <Text style={{ color: estaSelecionado ? '#FFF' : '#333', fontWeight: 'bold', fontSize: 12 }}>
                                                {item}
                                            </Text>
                                        </Pressable>
                                    )
                                })}
                            </View>

                            <Text style={style.label}>Ingredientes *</Text>
                            <View style={[style.modalInput, { paddingVertical: 10 }]}>
                                {this.state.ingredientes.map((item, index) => (
                                    <View key={index} style={{ marginBottom: 8, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#ddd' }}>
                                        {this.state.indexEdicaoIngrediente === index ? (
                                            <View style={{flexDirection: 'column', gap: 5}}>
                                                <TextInput 
                                                    style={{backgroundColor: '#fff', padding: 8, borderRadius: 5, borderWidth: 1, borderColor: '#eee'}}
                                                    placeholder="Nome. Ex: Ovo"
                                                    value={this.state.edicaoIngredienteNome}
                                                    onChangeText={(t) => this.setState({ edicaoIngredienteNome: t })}
                                                />
                                                <View style={{flexDirection: 'row', gap: 5}}>
                                                    <TextInput 
                                                        style={{flex: 1, backgroundColor: '#fff', padding: 8, borderRadius: 5, borderWidth: 1, borderColor: '#eee', height: 50}}
                                                        placeholder="Qtd. Ex: 3"
                                                        value={this.state.edicaoIngredienteQuantidade}
                                                        onChangeText={(t) => this.setState({ edicaoIngredienteQuantidade: t })}
                                                        keyboardType="numeric"
                                                    />
                                                    <View style={{flex: 1.8, backgroundColor: '#fff', borderRadius: 5, borderWidth: 1, borderColor: '#eee', justifyContent: 'center', height: 50, overflow: 'hidden'}}>
                                                        <Picker
                                                            selectedValue={this.state.edicaoIngredienteUnidade}
                                                            onValueChange={(val) => this.setState({edicaoIngredienteUnidade: val})}
                                                            style={{height: 50, width: '100%'}}
                                                        >
                                                            <Picker.Item label="Unidades" value="unidades" />
                                                            <Picker.Item label="Gramas (g)" value="g" />
                                                            <Picker.Item label="Quilos (kg)" value="kg" />
                                                            <Picker.Item label="Mililitros (ml)" value="ml" />
                                                            <Picker.Item label="Litros (L)" value="L" />
                                                            <Picker.Item label="Colher (sopa)" value="colher(es) de sopa" />
                                                            <Picker.Item label="Colher (chá)" value="colher(es) de chá" />
                                                            <Picker.Item label="Xícara(s)" value="xícara(s)" />
                                                        </Picker>
                                                    </View>
                                                </View>
                                                <View style={{flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 5}}>
                                                    <Pressable onPress={this.salvarEdicaoIngrediente} style={{padding: 5}}>
                                                        <AntDesign name="check-circle" size={24} color="#4CAF50" />
                                                    </Pressable>
                                                    <Pressable onPress={() => this.setState({ indexEdicaoIngrediente: null })} style={{padding: 5}}>
                                                        <AntDesign name="close-circle" size={24} color="#999" />
                                                    </Pressable>
                                                </View>
                                            </View>
                                        ) : (
                                            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                                                <Text style={{color: '#333', flex: 1}}>• {item.nome} - {item.quantidade} {item.unidade}</Text>
                                                <View style={{flexDirection: 'row', alignItems: 'center', gap: 15}}>
                                                    <Pressable onPress={() => this.iniciarEdicaoIngrediente(index)}>
                                                        <AntDesign name="edit" size={18} color="#007AFF" />
                                                    </Pressable>
                                                    <Pressable onPress={() => this.removerIngrediente(index)}>
                                                        <AntDesign name="delete" size={18} color="#F44336" />
                                                    </Pressable>
                                                </View>
                                            </View>
                                        )}
                                    </View>
                                ))}

                                {this.state.isAddingIngrediente ? (
                                    <View style={{flexDirection: 'column', gap: 5, marginTop: 5}}>
                                        <TextInput 
                                            style={{backgroundColor: '#fff', padding: 8, borderRadius: 5, borderWidth: 1, borderColor: '#eee'}} 
                                            placeholder="Nome do Ingrediente. Ex: Ovo"
                                            value={this.state.novoIngredienteNome}
                                            onChangeText={(t) => this.setState({ novoIngredienteNome: t })}
                                            autoFocus
                                        />
                                        <View style={{flexDirection: 'row', gap: 5}}>
                                            <TextInput 
                                                style={{flex: 1, backgroundColor: '#fff', padding: 8, borderRadius: 5, borderWidth: 1, borderColor: '#eee', height: 50}} 
                                                placeholder="Qtd. Ex: 3"
                                                value={this.state.novoIngredienteQuantidade}
                                                onChangeText={(t) => this.setState({ novoIngredienteQuantidade: t })}
                                                keyboardType="numeric"
                                            />
                                            <View style={{flex: 1.8, backgroundColor: '#fff', borderRadius: 5, borderWidth: 1, borderColor: '#eee', justifyContent: 'center', height: 50, overflow: 'hidden'}}>
                                                <Picker
                                                    selectedValue={this.state.novoIngredienteUnidade}
                                                    onValueChange={(val) => this.setState({novoIngredienteUnidade: val})}
                                                    style={{height: 50, width: '100%'}}
                                                >
                                                    <Picker.Item label="Unidades" value="unidades" />
                                                    <Picker.Item label="Gramas (g)" value="g" />
                                                    <Picker.Item label="Quilos (kg)" value="kg" />
                                                    <Picker.Item label="Mililitros (ml)" value="ml" />
                                                    <Picker.Item label="Litros (L)" value="L" />
                                                    <Picker.Item label="Colher (sopa)" value="colher(es) de sopa" />
                                                    <Picker.Item label="Colher (chá)" value="colher(es) de chá" />
                                                    <Picker.Item label="Xícara(s)" value="xícara(s)" />
                                                </Picker>
                                            </View>
                                        </View>
                                        <View style={{flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 5}}>
                                            <Pressable onPress={this.salvarIngrediente} style={{padding: 5}}>
                                                <AntDesign name="check-circle" size={24} color="#4CAF50" />
                                            </Pressable>
                                            <Pressable onPress={() => this.setState({ isAddingIngrediente: false, novoIngredienteNome: '', novoIngredienteQuantidade: '' })} style={{padding: 5}}>
                                                <AntDesign name="close-circle" size={24} color="#F44336" />
                                            </Pressable>
                                        </View>
                                    </View>
                                ) : (
                                    <Pressable onPress={() => this.setState({ isAddingIngrediente: true })} style={{alignItems: 'center', marginTop: 5, paddingVertical: 10}}>
                                        <Text style={{color: '#FF9D4D', fontWeight: 'bold'}}>+ Adicionar Ingrediente</Text>
                                    </Pressable>
                                )}
                            </View>

                            <Text style={style.label}>Modo de Preparo *</Text>
                            <View style={[style.modalInput, { paddingVertical: 10 }]}>
                                {this.state.modoPreparo.map((item, index) => (
                                    <View key={index} style={{ marginBottom: 8, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#ddd' }}>
                                        {this.state.indexEdicaoModo === index ? (
                                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                                <TextInput 
                                                    style={{flex: 1, backgroundColor: '#fff', padding: 8, borderRadius: 5, borderWidth: 1, borderColor: '#eee'}}
                                                    value={this.state.textoEdicaoModo}
                                                    onChangeText={(t) => this.setState({ textoEdicaoModo: t })}
                                                    multiline autoFocus
                                                />
                                                <Pressable onPress={this.salvarEdicaoModo} style={{marginLeft: 10}}>
                                                    <AntDesign name="check-circle" size={22} color="#4CAF50" />
                                                </Pressable>
                                                <Pressable onPress={() => this.setState({ indexEdicaoModo: null })} style={{marginLeft: 10}}>
                                                    <AntDesign name="close-circle" size={22} color="#999" />
                                                </Pressable>
                                            </View>
                                        ) : (
                                            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                                                <Text style={{color: '#333', flex: 1}}>{index + 1}. {item}</Text>
                                                <View style={{flexDirection: 'row', alignItems: 'center', gap: 15}}>
                                                    <Pressable onPress={() => this.iniciarEdicaoModo(index)}>
                                                        <AntDesign name="edit" size={18} color="#007AFF" />
                                                    </Pressable>
                                                    <Pressable onPress={() => this.removerModo(index)}>
                                                        <AntDesign name="delete" size={18} color="#F44336" />
                                                    </Pressable>
                                                </View>
                                            </View>
                                        )}
                                    </View>
                                ))}

                                {this.state.isAddingModo ? (
                                    <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 5}}>
                                        <TextInput 
                                            style={{flex: 1, backgroundColor: '#fff', padding: 8, borderRadius: 5, borderWidth: 1, borderColor: '#eee'}} 
                                            placeholder={`Passo ${this.state.modoPreparo.length + 1}...`}
                                            value={this.state.novoModo}
                                            onChangeText={(t) => this.setState({ novoModo: t })}
                                            autoFocus multiline
                                        />
                                        <Pressable onPress={this.salvarModo} style={{marginLeft: 10}}>
                                            <AntDesign name="check-circle" size={24} color="#4CAF50" />
                                        </Pressable>
                                        <Pressable onPress={() => this.setState({ isAddingModo: false, novoModo: '' })} style={{marginLeft: 10}}>
                                            <AntDesign name="close-circle" size={24} color="#F44336" />
                                        </Pressable>
                                    </View>
                                ) : (
                                    <Pressable onPress={() => this.setState({ isAddingModo: true })} style={{alignItems: 'center', marginTop: 5, paddingVertical: 10}}>
                                        <Text style={{color: '#FF9D4D', fontWeight: 'bold'}}>+ Adicionar Passo</Text>
                                    </Pressable>
                                )}
                            </View>
                        </ScrollView>

                        <View style={style.modalBotoes}>
                            <Pressable style={[style.modalBotao, style.modalBotaoCancelar]} onPress={this.props.onClose}>
                                <Text style={style.modalTextoBotao}>Cancelar</Text>
                            </Pressable>

                            <Pressable style={[style.modalBotao, style.modalBotaoSalvar]} onPress={this.salvarReceita}>
                                <Text style={style.modalTextoBotao}>Salvar</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        )
    }
}