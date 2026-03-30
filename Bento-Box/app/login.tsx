import { Component } from "react";
import {Text, View } from "react-native";
import style from "./styleSheet";

export default class Login extends Component {
    render (){
        return (
            <View style={{flexDirection: 'column'}}>
                <View style={style.header}>
                    <Text style={{
                    }}>
                    Bento-Box</Text>
                </View>
            </View>
        )
    }
}

