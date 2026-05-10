import { StyleSheet } from "react-native";

const style = StyleSheet.create ({
    header: {
        flexDirection: 'row',
        backgroundColor: '#FF9D4D', 
        width: '100%', 
        height: 117,
        gap: 10,
        marginTop: 39,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative'
    },

    footer: {
        flexDirection: 'row',
        backgroundColor: '#FF9D4D', 
        width: '100%',
        height: 85,
        gap: 30,
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
    },

    headerInternoWrapper: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    headerInterno: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
        paddingBottom: 12,
        marginBottom: 15,
    },
    headerInternoTitulo: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF9D4D', 
    },
    headerInternoSub: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    destaqueCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        overflow: 'hidden',
        elevation: 4, 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        marginBottom: 25,
    },
    destaqueImagem: {
        width: '100%',
        height: 220,
        backgroundColor: '#eaeaea',
    },
    placeholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    destaqueInfo: {
        padding: 20,
    },
    destaqueNome: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    destaqueCulinaria: {
        fontSize: 12,
        color: '#FF9D4D',
        textTransform: 'uppercase',
        fontWeight: 'bold',
        marginBottom: 10,
    },
    destaqueDescricao: {
        fontSize: 14,
        color: '#555',
        lineHeight: 20,
    },
    dicaCard: {
        backgroundColor: '#FFF3E0', 
        borderRadius: 12,
        padding: 20,
        borderLeftWidth: 6,
        borderLeftColor: '#FF9D4D', 
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        marginBottom: 25,
    },
    dicaTitulo: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#d8721c', 
        marginBottom: 8,
    },
    dicaTexto: {
        fontSize: 14,
        color: '#555',
        lineHeight: 22,
    },
    quizCard: {
        backgroundColor: '#fdfdfd',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 20,
        marginBottom: 30, 
    },
    quizInnerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    quizConteudo: {
        flex: 1,
        paddingRight: 15,
    },
    quizTitulo: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    quizTexto: {
        fontSize: 14,
        color: '#555',
        lineHeight: 20,
    },
    quizEmBreveBadge: {
        backgroundColor: '#eee',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
    },
    quizEmBreveTexto: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#888',
    },

    secaoHeaderWrapper: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
        paddingBottom: 15,
        alignItems: 'center',
    },
    tituloSecao: {
        fontSize: 24, 
        fontWeight: 'bold', 
        color: '#333'
    },
    subtituloSecao: {
        fontSize: 14, 
        color: '#666', 
        marginTop: 5
    },
    gridContainer: {
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        justifyContent: 'space-between', 
        width: '100%'
    },
    vazioContainer: {
        alignItems: 'center', 
        justifyContent: 'center', 
        marginTop: 50,
        backgroundColor: '#fff',
        padding: 30,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#eee'
    },
    vazioTexto: {
        fontSize: 18, 
        fontWeight: 'bold', 
        color: '#555', 
        marginBottom: 5 
    },
    vazioSubtexto: {
        fontSize: 14, 
        color: '#888', 
        textAlign: 'center' 
    },

    btnLogout: {
        position: 'absolute',
        bottom: 10,
        right: 15,
        padding: 5
    },

    botaoGerar: {
        backgroundColor: '#FF9D4D',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 8,
        marginBottom: 20,
        shadowColor: '#FF9D4D',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 4
    },
    textoBotaoGerar: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold'
    },
    cardDia: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    topoCard: {
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 12
    },
    tituloDia: {
        fontSize: 18, 
        fontWeight: 'bold', 
        color: '#333'
    },
    refeicaoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F9F9F9',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#FF9D4D'
    },
    tipoRefeicao: {
        fontSize: 12,
        color: '#888',
        fontWeight: '600',
        textTransform: 'uppercase'
    },
    nomeRefeicao: {
        fontSize: 15,
        color: '#333',
        fontWeight: '500',
        marginTop: 2
    },
    estadoVazioPlanejamento: {
        backgroundColor: '#FAFAFA', 
        padding: 20, 
        borderRadius: 8, 
        alignItems: 'center', 
        borderStyle: 'dashed', 
        borderWidth: 1, 
        borderColor: '#ddd' 
    },
    containerGeral: {
        flex: 1, 
        backgroundColor: '#f5f5f5'
    },
    scrollContent: {
        flexGrow: 1, 
        padding: 20, 
        paddingBottom: 10
    },
    botoesAcaoWrapper: {
        flexDirection: 'row', 
        gap: 10, 
        marginTop: 10
    },
    botaoGerarFlex: {
        flex: 1, 
        marginBottom: 0
    },
    iconeMarginRight: {
        marginRight: 10
    },
    botaoMeusPlanos: {
        backgroundColor: '#FF9D4D', 
        paddingHorizontal: 20, 
        marginBottom: 0
    },
    atualTextoWrapper: {
        marginTop: 10, 
        marginBottom: 20
    },
    atualTexto: {
        fontSize: 14, 
        color: '#666', 
        fontWeight: '500'
    },
    atualTextoDestaque: {
        color: '#333', 
        fontWeight: 'bold'
    },
    btnPaddingPadrao: {
        padding: 4
    },
    flexInfo: {
        flex: 1
    },
    refeicaoTempo: {
        fontSize: 12, 
        color: "#888", 
        marginTop: 4
    },
    refeicaoAcoesWrapper: {
        flexDirection: 'row', 
        gap: 12
    },
    margemInferiorIcone: {
        marginBottom: 8
    },
    modalCardGrande: {
        height: '80%'
    },
    modalHeaderBox: {
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        marginBottom: 20
    },
    itemListaModal: {
        marginVertical: 6
    },
    dataPlanoModal: {
        fontSize: 12, 
        color: '#999', 
        marginTop: 4
    },
    btnExcluirPlanoPad: {
        padding: 10
    },
    textoMensagemVazia: {
        textAlign: 'center', 
        color: '#888', 
        marginTop: 20
    },
    itemSugestaoReceita: {
        marginVertical: 5
    },
        estadoVazioTexto: {
        color: '#999', 
        fontSize: 14, 
        textAlign: 'center' 
    }
})

export default style;