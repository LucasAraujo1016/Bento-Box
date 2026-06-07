import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface ProdutoEncontrado {
    nomeCompleto: string;
    nomeGenerico: string;
    codigoBarras: string;
}

interface ScannerCodigoBarrasProps {
    visivel: boolean;
    fechar: () => void;
    onProdutoIdentificado: (produto: ProdutoEncontrado) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Extrai o nome genérico (categoria) de um produto a partir dos dados
 * retornados pela Open Food Facts.
 *
 * Prioridade:
 *  1. generic_name_pt / generic_name_pt-BR
 *  2. generic_name (qualquer idioma)
 *  3. Primeira categoria da lista (ex: "en:butters" → "Manteiga")
 *  4. Primeiro token significativo do product_name (sem marca/peso)
 */
function extrairNomeGenerico(produto: Record<string, unknown>): string {
    // 1. generic_name em português
    const genericPt =
        (produto.generic_name_pt as string) ||
        (produto['generic_name_pt-BR'] as string) ||
        (produto.generic_name as string);

    if (genericPt && genericPt.trim().length > 0) {
        return capitalizar(genericPt.trim());
    }

    // 2. Tentar extrair da lista de categorias (vem em inglês/fr com prefixo de idioma)
    const categories = (produto.categories as string) || '';
    if (categories) {
        const partes = categories.split(',');
        for (const parte of partes) {
            const limpo = parte
                .replace(/^[a-z]{2}:/, '')   // remove prefixo "en:", "pt:", etc.
                .replace(/-/g, ' ')
                .trim();
            if (limpo.length > 2 && limpo.length < 30) {
                const traduzido = traduzirCategoria(limpo);
                if (traduzido) return capitalizar(traduzido);
            }
        }
    }

    // 3. Primeiro token do product_name sem peso/marca
    const productName = (produto.product_name as string) || '';
    if (productName) {
        // Remove tokens que parecem peso/volume (ex: "200g", "1L") ou números
        const tokens = productName.split(/[\s,]+/).filter(t => !/^\d/.test(t));
        if (tokens.length > 0) return capitalizar(tokens[0]);
    }

    return 'Item';
}

/** Mapa simples de categorias comuns em inglês → português */
function traduzirCategoria(categoria: string): string | null {
    const map: Record<string, string> = {
        butters: 'Manteiga',
        butter: 'Manteiga',
        margarines: 'Margarina',
        margarine: 'Margarina',
        milks: 'Leite',
        milk: 'Leite',
        'whole milk': 'Leite Integral',
        cheeses: 'Queijo',
        cheese: 'Queijo',
        yogurts: 'Iogurte',
        yogurt: 'Iogurte',
        eggs: 'Ovos',
        'chicken eggs': 'Ovos',
        rice: 'Arroz',
        'white rice': 'Arroz Branco',
        beans: 'Feijão',
        sugar: 'Açúcar',
        salt: 'Sal',
        flour: 'Farinha de Trigo',
        'wheat flour': 'Farinha de Trigo',
        'corn flour': 'Fubá',
        'sunflower oil': 'Óleo de Girassol',
        'olive oil': 'Azeite',
        oil: 'Óleo',
        pasta: 'Macarrão',
        'pasta noodles': 'Macarrão',
        noodles: 'Macarrão',
        bread: 'Pão',
        'white bread': 'Pão de Forma',
        coffee: 'Café',
        'ground coffee': 'Café Moído',
        tea: 'Chá',
        juice: 'Suco',
        'orange juice': 'Suco de Laranja',
        water: 'Água',
        'mineral water': 'Água Mineral',
        chocolate: 'Chocolate',
        'dark chocolate': 'Chocolate Amargo',
        'milk chocolate': 'Chocolate ao Leite',
        'cooking cream': 'Creme de Leite',
        'heavy cream': 'Creme de Leite',
        cream: 'Creme de Leite',
        'tomato sauce': 'Molho de Tomate',
        ketchup: 'Ketchup',
        mustard: 'Mostarda',
        mayonnaise: 'Maionese',
        vinegar: 'Vinagre',
        honey: 'Mel',
        jam: 'Geleia',
        jams: 'Geleia',
        cereals: 'Cereal',
        'breakfast cereals': 'Cereal Matinal',
        crackers: 'Biscoito',
        cookies: 'Biscoito',
        biscuits: 'Biscoito',
        chips: 'Salgadinho',
        snacks: 'Salgadinho',
        ham: 'Presunto',
        sausages: 'Linguiça',
        sausage: 'Linguiça',
        bacon: 'Bacon',
        tuna: 'Atum',
        sardines: 'Sardinha',
        chicken: 'Frango',
        beef: 'Carne Bovina',
        pork: 'Carne Suína',
        'frozen vegetables': 'Legumes Congelados',
        vegetables: 'Legumes',
        fruits: 'Frutas',
        apples: 'Maçã',
        bananas: 'Banana',
        oranges: 'Laranja',
        tomatoes: 'Tomate',
        onions: 'Cebola',
        garlic: 'Alho',
        potatoes: 'Batata',
        carrots: 'Cenoura',
        spinach: 'Espinafre',
        lettuce: 'Alface',
        soups: 'Sopa',
        soup: 'Sopa',
        lentils: 'Lentilha',
        chickpeas: 'Grão de Bico',
        'black beans': 'Feijão Preto',
        condensed: 'Leite Condensado',
        'condensed milk': 'Leite Condensado',
    };

    const chave = categoria.toLowerCase();
    return map[chave] || null;
}

function capitalizar(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// ─── Busca na Open Food Facts ─────────────────────────────────────────────────

async function buscarProdutoPorCodigoBarras(
    codigo: string
): Promise<ProdutoEncontrado | null> {
    try {
        // Tenta primeiro com locale pt_BR, depois sem locale
        const urls = [
            `https://world.openfoodfacts.org/api/v0/product/${codigo}.json`,
        ];

        for (const url of urls) {
            const resp = await fetch(url, {
                headers: { 'User-Agent': 'BentoBox-App/1.0' },
            });

            if (!resp.ok) continue;

            const json = await resp.json();

            if (json.status === 1 && json.product) {
                const produto = json.product as Record<string, unknown>;
                const nomeCompleto =
                    (produto.product_name_pt as string) ||
                    (produto['product_name_pt-BR'] as string) ||
                    (produto.product_name as string) ||
                    'Produto desconhecido';

                const nomeGenerico = extrairNomeGenerico(produto);

                return {
                    nomeCompleto: nomeCompleto.trim(),
                    nomeGenerico,
                    codigoBarras: codigo,
                };
            }
        }

        return null;
    } catch {
        return null;
    }
}

// ─── Componente ───────────────────────────────────────────────────────────────

const SCAN_COOLDOWN_MS = 2500; // evita disparos duplos

export default function ScannerCodigoBarras({
    visivel,
    fechar,
    onProdutoIdentificado,
}: ScannerCodigoBarrasProps) {
    const [permissao, solicitarPermissao] = useCameraPermissions();
    const [buscando, setBuscando] = useState(false);
    const [ultimoCodigo, setUltimoCodigo] = useState<string | null>(null);
    const [feedbackTexto, setFeedbackTexto] = useState('Aponte para o código de barras');
    const [feedbackCor, setFeedbackCor] = useState('#fff');

    const podeScanear = useRef(true);
    const animOpacidade = useRef(new Animated.Value(1)).current;
    const animLinha = useRef(new Animated.Value(0)).current;

    const { height: screenH } = Dimensions.get('window');

    // Anima a linha de escaneamento
    useEffect(() => {
        if (!visivel) return;
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(animLinha, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(animLinha, {
                    toValue: 0,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ])
        );
        loop.start();
        return () => loop.stop();
    });

    // Reset ao abrir
    useEffect(() => {
        if (visivel) {
            setUltimoCodigo(null);
            setBuscando(false);
            setFeedbackTexto('Aponte para o código de barras');
            setFeedbackCor('#fff');
            podeScanear.current = true;
        }
    }, [visivel]);

    const handleBarcodeScan = async (result: BarcodeScanningResult) => {
        if (!podeScanear.current || buscando) return;
        const codigo = result.data;
        if (codigo === ultimoCodigo) return;

        podeScanear.current = false;
        setUltimoCodigo(codigo);
        setBuscando(true);
        setFeedbackTexto('Buscando produto...');
        setFeedbackCor('#FF9D4D');

        // Pulsa a opacidade para dar feedback visual
        Animated.sequence([
            Animated.timing(animOpacidade, { toValue: 0.4, duration: 150, useNativeDriver: true }),
            Animated.timing(animOpacidade, { toValue: 1, duration: 150, useNativeDriver: true }),
        ]).start();

        const produto = await buscarProdutoPorCodigoBarras(codigo);

        setBuscando(false);

        if (produto) {
            setFeedbackTexto(`✓ ${produto.nomeGenerico} encontrado!`);
            setFeedbackCor('#4CAF50');

            // Pequeno delay para o usuário ver o feedback antes de fechar
            setTimeout(() => {
                onProdutoIdentificado(produto);
                fechar();
            }, 800);
        } else {
            // Produto não encontrado na base → pede para o usuário nomear manualmente
            setFeedbackTexto('Produto não encontrado na base');
            setFeedbackCor('#FF6B6B');

            Alert.alert(
                'Produto não encontrado',
                `O código "${codigo}" não foi encontrado na base de dados.\n\nDeseja adicioná-lo manualmente?`,
                [
                    {
                        text: 'Tentar novamente',
                        onPress: () => {
                            setFeedbackTexto('Aponte para o código de barras');
                            setFeedbackCor('#fff');
                            setTimeout(() => {
                                podeScanear.current = true;
                            }, SCAN_COOLDOWN_MS);
                        },
                    },
                    {
                        text: 'Adicionar manualmente',
                        onPress: () => fechar(),
                    },
                ]
            );
        }

        // Libera o scanner após cooldown (caso o usuário tente novamente)
        setTimeout(() => {
            podeScanear.current = true;
        }, SCAN_COOLDOWN_MS);
    };

    // ─── Renderização condicional de estados ──────────────────────────────────

    if (!visivel) return null;

    if (!permissao) {
        return (
            <Modal visible={visivel} transparent animationType="fade">
                <View style={styles.overlay}>
                    <ActivityIndicator size="large" color="#FF9D4D" />
                </View>
            </Modal>
        );
    }

    if (!permissao.granted) {
        return (
            <Modal visible={visivel} transparent animationType="slide">
                <View style={styles.overlay}>
                    <View style={styles.permissaoContainer}>
                        <FontAwesome5 name="camera" size={48} color="#FF9D4D" />
                        <Text style={styles.permissaoTitulo}>Acesso à câmera</Text>
                        <Text style={styles.permissaoTexto}>
                            Para escanear códigos de barras precisamos de acesso à sua câmera.
                        </Text>
                        <TouchableOpacity
                            style={styles.botaoPermissao}
                            onPress={solicitarPermissao}
                        >
                            <Text style={styles.txtBotaoPermissao}>Permitir câmera</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.botaoCancelar} onPress={fechar}>
                            <Text style={styles.txtBotaoCancelar}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    }

    // Calculo da posição da linha animada dentro da moldura
    const linhaTranslate = animLinha.interpolate({
        inputRange: [0, 1],
        outputRange: [-80, 80],
    });

    return (
        <Modal visible={visivel} transparent={false} animationType="slide">
            <View style={styles.fullScreen}>
                <Animated.View style={{ flex: 1, opacity: animOpacidade }}>
                    <CameraView
                        style={StyleSheet.absoluteFillObject}
                        facing="back"
                        barcodeScannerSettings={{
                            barcodeTypes: [
                                'ean13',
                                'ean8',
                                'upc_a',
                                'upc_e',
                                'code128',
                                'code39',
                                'qr',
                                'pdf417',
                                'aztec',
                                'datamatrix',
                                'itf14',
                                'codabar',
                            ],
                        }}
                        onBarcodeScanned={handleBarcodeScan}
                    />
                </Animated.View>

                {/* Overlay escuro com "janela" central */}
                <View style={styles.overlayEscuro} pointerEvents="none">
                    {/* Topo */}
                    <View style={[styles.overlayBloco, { height: screenH * 0.25 }]} />

                    {/* Meio: bordas laterais + moldura */}
                    <View style={styles.overlayMeio}>
                        <View style={styles.overlayLateral} />

                        {/* Moldura */}
                        <View style={styles.moldura}>
                            {/* Cantos decorativos */}
                            <View style={[styles.canto, styles.cantoTL]} />
                            <View style={[styles.canto, styles.cantoTR]} />
                            <View style={[styles.canto, styles.cantoBL]} />
                            <View style={[styles.canto, styles.cantoBR]} />

                            {/* Linha animada */}
                            {!buscando && (
                                <Animated.View
                                    style={[
                                        styles.linhaScanner,
                                        { transform: [{ translateY: linhaTranslate }] },
                                    ]}
                                />
                            )}

                            {/* Spinner quando buscando */}
                            {buscando && (
                                <View style={styles.spinnerContainer}>
                                    <ActivityIndicator size="large" color="#FF9D4D" />
                                </View>
                            )}
                        </View>

                        <View style={styles.overlayLateral} />
                    </View>

                    {/* Base */}
                    <View style={[styles.overlayBloco, { flex: 1 }]} />
                </View>

                {/* Cabeçalho */}
                <View style={styles.cabecalho}>
                    <TouchableOpacity style={styles.botaoFecharScanner} onPress={fechar}>
                        <FontAwesome5 name="times" size={20} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.tituloCabecalho}>Escanear Produto</Text>
                    <View style={{ width: 44 }} />
                </View>

                {/* Feedback inferior */}
                <View style={styles.feedbackContainer}>
                    <View style={[styles.feedbackBadge, { borderColor: feedbackCor }]}>
                        <FontAwesome5
                            name={buscando ? 'spinner' : 'barcode'}
                            size={16}
                            color={feedbackCor}
                            style={{ marginRight: 8 }}
                        />
                        <Text style={[styles.feedbackTexto, { color: feedbackCor }]}>
                            {feedbackTexto}
                        </Text>
                    </View>

                    <Text style={styles.dica}>
                        Centralize o código na moldura acima
                    </Text>
                </View>
            </View>
        </Modal>
    );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const MOLDURA_W = 280;
const MOLDURA_H = 160;
const BORDA_COR = '#FF9D4D';
const BORDA_R = 12;
const CANTO_LEN = 24;
const CANTO_ESPESSURA = 3;

const styles = StyleSheet.create({
    fullScreen: { flex: 1, backgroundColor: '#000' },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },

    // Permissão
    permissaoContainer: { backgroundColor: '#fff', borderRadius: 16, padding: 28, alignItems: 'center', width: '80%', gap: 16 },
    permissaoTitulo: { fontSize: 20, fontWeight: '700', color: '#222', marginTop: 8 },
    permissaoTexto: { fontSize: 15, color: '#555', textAlign: 'center', lineHeight: 22 },
    botaoPermissao: { backgroundColor: '#FF9D4D', borderRadius: 10, paddingVertical: 14, paddingHorizontal: 32, width: '100%', alignItems: 'center' },
    txtBotaoPermissao: { color: '#fff', fontWeight: '700', fontSize: 16 },
    botaoCancelar: { paddingVertical: 10 },
    txtBotaoCancelar: { color: '#888', fontSize: 15 },

    // Overlay escuro
    overlayEscuro: { ...StyleSheet.absoluteFillObject, zIndex: 2 },
    overlayBloco: { width: '100%', backgroundColor: 'rgba(0,0,0,0.60)' },
    overlayMeio: { flexDirection: 'row', height: MOLDURA_H },
    overlayLateral: { flex: 1, backgroundColor: 'rgba(0,0,0,0.60)' },

    // Moldura
    moldura: {
        width: MOLDURA_W,
        height: MOLDURA_H,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Cantos
    canto: { position: 'absolute', width: CANTO_LEN, height: CANTO_LEN },
    cantoTL: { top: 0, left: 0, borderTopWidth: CANTO_ESPESSURA, borderLeftWidth: CANTO_ESPESSURA, borderColor: BORDA_COR, borderTopLeftRadius: BORDA_R },
    cantoTR: { top: 0, right: 0, borderTopWidth: CANTO_ESPESSURA, borderRightWidth: CANTO_ESPESSURA, borderColor: BORDA_COR, borderTopRightRadius: BORDA_R },
    cantoBL: { bottom: 0, left: 0, borderBottomWidth: CANTO_ESPESSURA, borderLeftWidth: CANTO_ESPESSURA, borderColor: BORDA_COR, borderBottomLeftRadius: BORDA_R },
    cantoBR: { bottom: 0, right: 0, borderBottomWidth: CANTO_ESPESSURA, borderRightWidth: CANTO_ESPESSURA, borderColor: BORDA_COR, borderBottomRightRadius: BORDA_R },

    // Linha animada
    linhaScanner: { width: MOLDURA_W - 20, height: 2, backgroundColor: BORDA_COR, opacity: 0.85, borderRadius: 1 },
    spinnerContainer: { position: 'absolute' },

    // Cabeçalho
    cabecalho: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12 },
    botaoFecharScanner: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    tituloCabecalho: { color: '#fff', fontSize: 18, fontWeight: '700' },

    // Feedback
    feedbackContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10, paddingBottom: 52, paddingHorizontal: 24, alignItems: 'center', gap: 12 },
    feedbackBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.75)', borderRadius: 24, paddingHorizontal: 20, paddingVertical: 12, borderWidth: 1.5 },
    feedbackTexto: { fontSize: 15, fontWeight: '600' },
    dica: { color: 'rgba(255,255,255,0.55)', fontSize: 13 },
});