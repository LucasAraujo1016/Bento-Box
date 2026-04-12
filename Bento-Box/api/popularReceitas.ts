import mongoose from 'mongoose';
import { connectToMongoDB } from './database/mongodb';
import { Receita } from './receitas/receitas';

const JOAO_ID = '97e53c0b-af4f-414d-a714-93a5049236e1';
const MARIA_ID = '1cabc44b-405b-4dc9-864e-5740bfe5624b';
const CARLOS_ID = 'f5a3add1-bbb9-4ac5-b0d6-0a33e19837e9';

const receitasDeTeste = [
    // ------------------- RECEITAS DO JOÃO -------------------
    {
        autorId: JOAO_ID,
        autorNome: 'João Silva',
        nome: 'Feijoada Simples',
        // Nova imagem de ensopado de feijão/carne
        imagem: 'https://images.unsplash.com/photo-1551326844-4df70f78d0e9?q=80&w=1000&auto=format&fit=crop', 
        descricao: 'Uma versão mais rápida da tradicional feijoada brasileira.',
        tempoPreparo: 120,
        nivelHabilidade: 'intermediario',
        tipoCulinaria: 'brasileira',
        restricoes: ['Intolerante a Lactose', 'Sem Glúten'], 
        ingredientes: [
            { nome: 'Feijão Preto', quantidade: '500g' },
            { nome: 'Linguiça calabresa', quantidade: '2 un' },
            { nome: 'Carne seca', quantidade: '300g' }
        ],
        modoPreparo: [
            'Deixe a carne seca de molho.',
            'Cozinhe o feijão na panela de pressão.',
            'Frite as carnes e misture tudo.'
        ]
    },
    {
        autorId: JOAO_ID,
        autorNome: 'João Silva',
        nome: 'Brigadeiro de Panela',
        imagem: 'https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?q=80&w=1000&auto=format&fit=crop', // Brigadeiro/Trufas
        descricao: 'Doce típico brasileiro para alegrar o dia.',
        tempoPreparo: 20,
        nivelHabilidade: 'iniciante',
        tipoCulinaria: 'brasileira',
        restricoes: ['Vegetariano', 'Sem Glúten'],
        ingredientes: [
            { nome: 'Leite condensado', quantidade: '1 lata' },
            { nome: 'Achocolatado', quantidade: '4 colheres' },
            { nome: 'Manteiga', quantidade: '1 colher' }
        ],
        modoPreparo: [
            'Misture tudo em uma panela.',
            'Cozinhe em fogo baixo mexendo sem parar até desgrudar do fundo.'
        ]
    },
    {
        autorId: JOAO_ID,
        autorNome: 'João Silva',
        nome: 'Tacos Veganos de Lentilha',
        imagem: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?q=80&w=1000&auto=format&fit=crop', // Tacos
        descricao: 'Tacos crocantes recheados com lentilha temperada, muito leve e saudável.',
        tempoPreparo: 40,
        nivelHabilidade: 'intermediario',
        tipoCulinaria: 'mexicana',
        restricoes: ['Vegano', 'Vegetariano', 'Intolerante a Lactose', 'Alérgico a Amendoim', 'Alérgico a frutos do mar'],
        ingredientes: [
            { nome: 'Lentilha cozida', quantidade: '2 xícaras' },
            { nome: 'Tortilha de milho', quantidade: '6 un' },
            { nome: 'Páprica e cominho', quantidade: 'A gosto' }
        ],
        modoPreparo: [
            'Refogue a lentilha com os temperos.',
            'Aqueça as tortilhas e recheie.',
            'Sirva com guacamole e alface.'
        ]
    },

    // ------------------- RECEITAS DA MARIA -------------------
    {
        autorId: MARIA_ID,
        autorNome: 'Maria Oliveira',
        nome: 'Macarrão ao Pesto',
        imagem: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=1000&auto=format&fit=crop', // Macarrão ao pesto
        descricao: 'Massa clássica italiana com molho de manjericão fresco.',
        tempoPreparo: 25,
        nivelHabilidade: 'iniciante',
        tipoCulinaria: 'italiana',
        restricoes: ['Vegetariano'], 
        ingredientes: [
            { nome: 'Macarrão tipo espaguete', quantidade: '400g' },
            { nome: 'Manjericão fresco', quantidade: '1 maço' },
            { nome: 'Queijo parmesão ralado', quantidade: '50g' },
            { nome: 'Azeite', quantidade: '1/2 xícara' }
        ],
        modoPreparo: [
            'Cozinhe o macarrão até ficar al dente.',
            'Bata o manjericão, queijo e azeite no liquidificador.',
            'Misture o molho na massa quente.'
        ]
    },
    {
        autorId: MARIA_ID,
        autorNome: 'Maria Oliveira',
        nome: 'Risoto de Cogumelos',
        imagem: 'https://images.unsplash.com/photo-1633504581786-316c8002b1b9?q=80&w=1000&auto=format&fit=crop', // Risoto
        descricao: 'Risoto cremoso perfeito para jantares sofisticados.',
        tempoPreparo: 50,
        nivelHabilidade: 'profissional',
        tipoCulinaria: 'italiana',
        restricoes: ['Vegetariano', 'Sem Glúten', 'Alérgico a Amendoim'], 
        ingredientes: [
            { nome: 'Arroz arbóreo', quantidade: '2 xícaras' },
            { nome: 'Cogumelos frescos (Paris e Shitake)', quantidade: '300g' },
            { nome: 'Caldo de legumes', quantidade: '1 litro' }
        ],
        modoPreparo: [
            'Refogue os cogumelos e reserve.',
            'Toste o arroz e vá adicionando o caldo de legumes aos poucos, mexendo sempre.',
            'No final, adicione os cogumelos e finalize com manteiga.'
        ]
    },
    {
        autorId: MARIA_ID,
        autorNome: 'Maria Oliveira',
        nome: 'Ceviche de Tilápia',
        imagem: 'https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?q=80&w=1000&auto=format&fit=crop', // Ceviche
        descricao: 'Apesar de ter origens no Peru, essa é uma adaptação de frutos do mar bem fresca.',
        tempoPreparo: 30,
        nivelHabilidade: 'iniciante',
        tipoCulinaria: 'japonesa', 
        restricoes: ['Sem Glúten', 'Intolerante a Lactose', 'Alérgico a Amendoim'], 
        ingredientes: [
            { nome: 'Filé de tilápia limpo', quantidade: '400g' },
            { nome: 'Limão tahiti (suco)', quantidade: '5 un' },
            { nome: 'Cebola roxa', quantidade: '1 un' }
        ],
        modoPreparo: [
            'Corte a tilápia em cubos pequenos.',
            'Fatie a cebola finamente.',
            'Misture tudo com o suco de limão e deixe marinar por 15 minutos na geladeira.'
        ]
    },

    // ------------------- RECEITAS DO CARLOS -------------------
    {
        autorId: CARLOS_ID,
        autorNome: 'Carlos Mendes',
        nome: 'Sushi Básico (Maki)',
        imagem: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=1000&auto=format&fit=crop', // Sushi
        descricao: 'Rolinhos de arroz e alga recheados com pepino e salmão.',
        tempoPreparo: 60,
        nivelHabilidade: 'intermediario',
        tipoCulinaria: 'japonesa',
        restricoes: ['Sem Glúten', 'Intolerante a Lactose', 'Alérgico a Amendoim'],
        ingredientes: [
            { nome: 'Arroz japonês (Gohan)', quantidade: '2 xícaras' },
            { nome: 'Alga Nori', quantidade: '4 folhas' },
            { nome: 'Salmão fresco', quantidade: '200g' },
            { nome: 'Pepino japonês', quantidade: '1 un' }
        ],
        modoPreparo: [
            'Faça o arroz e tempere com vinagre de arroz (Su).',
            'Corte o salmão e o pepino em tiras longas.',
            'Espalhe o arroz na alga, adicione o recheio e enrole com a esteira.'
        ]
    },
    {
        autorId: CARLOS_ID,
        autorNome: 'Carlos Mendes',
        nome: 'Lamen de Frango',
        // Nova imagem clássica de Lamen
        imagem: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=1000&auto=format&fit=crop', 
        descricao: 'Sopa de macarrão com caldo rico e saboroso, tradicional do Japão.',
        tempoPreparo: 240, 
        nivelHabilidade: 'profissional',
        tipoCulinaria: 'japonesa',
        restricoes: ['Intolerante a Lactose'], 
        ingredientes: [
            { nome: 'Macarrão para lamen', quantidade: '400g' },
            { nome: 'Carcaça de frango', quantidade: '1 un' },
            { nome: 'Shoyu', quantidade: '1/2 xícara' },
            { nome: 'Ovo cozido', quantidade: '2 un' }
        ],
        modoPreparo: [
            'Cozinhe a carcaça de frango submersa em água por 3 horas para fazer o caldo.',
            'Tempere o caldo com shoyu, alho e gengibre.',
            'Cozinhe o macarrão à parte, coloque no bowl e despeje o caldo quente.'
        ]
    },
    {
        autorId: CARLOS_ID,
        autorNome: 'Carlos Mendes',
        nome: 'Guacamole Autêntico',
        imagem: 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?q=80&w=1000&auto=format&fit=crop', // Guacamole
        descricao: 'Aperitivo clássico mexicano.',
        tempoPreparo: 15,
        nivelHabilidade: 'iniciante',
        tipoCulinaria: 'mexicana',
        restricoes: ['Vegano', 'Vegetariano', 'Sem Glúten', 'Intolerante a Lactose', 'Alérgico a Amendoim', 'Alérgico a frutos do mar'], 
        ingredientes: [
            { nome: 'Abacate maduro', quantidade: '2 un' },
            { nome: 'Tomate', quantidade: '1 un' },
            { nome: 'Cebola branca', quantidade: '1/2 un' },
            { nome: 'Coentro fresco', quantidade: 'A gosto' }
        ],
        modoPreparo: [
            'Amasse o abacate com um garfo.',
            'Pique o tomate e a cebola em cubos pequenos.',
            'Misture tudo com suco de limão, sal e coentro fresco.'
        ]
    }
];

async function seedReceitas() {
    console.log('🔗 Conectando ao MongoDB...');
    try {
        await connectToMongoDB();
        console.log('✅ Conectado com sucesso!');

        console.log('🗑️ Apagando receitas cadastradas anteriormente...');
        await Receita.deleteMany({});
        console.log('✅ Receitas antigas apagadas!');

        console.log('🔥 Inserindo novas receitas com imagens...');
        const receitasCriadas = await Receita.insertMany(receitasDeTeste);

        console.log(`✅ ${receitasCriadas.length} receitas foram inseridas no banco de dados com sucesso!`);
    } catch (error) {
        console.error('❌ Erro durante a inserção das receitas:', error);
    } finally {
        console.log('🔌 Desconectando do MongoDB...');
        await mongoose.disconnect();
        process.exit(0);
    }
}

seedReceitas();