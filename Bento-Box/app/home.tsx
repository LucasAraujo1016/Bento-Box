import { Component } from "react";
import { View, ScrollView, Text } from "react-native";
import HeaderCustomizado from "./components/header";
import FooterCustomizado from "./components/footer";

export default class Login extends Component {
    render (){
        return (
            <View style={{ flex: 1 }}> 
                <HeaderCustomizado />
                
                <ScrollView style={{ flex: 1, padding: 20 }}>
                    <Text>Aqui vai o conteúdo da sua página Home!</Text>
                </ScrollView>
                
                <FooterCustomizado />
            </View>
        )
    }
}