import { StyleSheet } from "react-native";

const style = StyleSheet.create ({
    header: {
        flexDirection: 'row',
        backgroundColor: '#FF9D4D', 
        width: '100%', 
        height: 117,
        gap: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },

    footer: {
        flexDirection: 'row',
        backgroundColor: '#FF9D4D', 
        width: '100%',
        height: 85,
        gap: 40,
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
    
    nova_receita: {
        flexDirection: 'row',
        backgroundColor: '#D9D9D9',
        width: 357,
        height: 58,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        fontWeight: 'bold',
        paddingLeft: 10,
        gap: 20     
    },

    login_button: {
        backgroundColor: '#FF9D4D',
        width: 302,
        height: 58,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        fontWeight: 'bold',
    },

    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },
    modalCard: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitulo: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    modalInput: {
        backgroundColor: '#F0F0F0',
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        fontSize: 16,
    },
    modalBotoes: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    modalBotao: {
        flex: 1,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    modalBotaoCancelar: {
        backgroundColor: '#D9D9D9',
    },
    modalBotaoSalvar: {
        backgroundColor: '#FF9D4D',
    },
    modalTextoBotao: {
        fontWeight: 'bold',
        fontSize: 16,
        color: 'black',
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#333',
    }
})

export default style;