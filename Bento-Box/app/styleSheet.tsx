import { StyleSheet } from "react-native";

const style = StyleSheet.create ({
    header: {
        flexDirection: 'row',
        backgroundColor: '#FF9D4D', 
        width: '100%', 
        height: 117,
        justifyContent: 'center',
        alignItems: 'center'
    },

    input_login: {
        backgroundColor: '#D9D9D9',
        width: 302,
        height: 58,
        borderRadius: 10,
        fontWeight: 'bold',
        paddingLeft: 10
    },

    login_button: {
        backgroundColor: '#FF9D4D',
        width: 302,
        height: 58,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        fontWeight: 'bold',
    }
})

export default style;