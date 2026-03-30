import { Component } from "react";
import {Image, Pressable, Text, TextInput, View } from "react-native";
import style from "./styleSheet";

export default class Login extends Component {
    render (){
        return (
            <View style={{flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '50'}}>
                <View style={{flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                    <Image source={require('../assets/images/logo.png')} style={{width: 250, height: 250, justifyContent: "center", alignItems: 'center'}} />
                    <Text style={{fontSize: 50, fontWeight: 'bold'}}>Bento-Box</Text>
                </View>
                <View style={{flexDirection: 'column', gap: '20'}}>
                    <TextInput style={style.input_login} placeholder="Nome de Usuário/E-mail"></TextInput>
                    <TextInput style={style.input_login} placeholder="Senha"></TextInput>
                </View>
                <View style={{flexDirection: 'column', gap: '20'}}>
                    <Pressable style={style.login_button}>
                        <Text style={{fontSize: 25}}>Entrar</Text>
                    </Pressable>
                    <Pressable style={style.login_button}>
                        <Text style={{fontSize: 25}}>Cadastrar</Text>
                    </Pressable>
                </View>
            </View>
        )
    }
}

