import express from 'express';
import cors from 'cors';
import cadastroRouter from './cadastro';
import loginRouter from './login';
import receitasRouter from './receitasRouter';

import supabase from './database/supabaseClient';
import { connectToMongoDB } from './database/mongodb';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/cadastro', cadastroRouter);
app.use('/api/login', loginRouter);
app.use('/api/receitas', receitasRouter);

const PORT = process.env.PORT || 3000;

async function checkSupabaseConnection() {
    try {
        const { error } = await supabase.from('usuarios').select('*').limit(1);

        if (error) {
            console.error('❌ Erro de comunicação com o Supabase:', error.message);
        } else {
            console.log('✅ Conexão com Supabase estabelecida com sucesso!');
        }
    } catch (err) {
        console.error('❌ Supabase Falhou:', err);
    }
}

app.listen(PORT, async () => {
    console.log(`✅ Servidor rodando na porta ${PORT}`);
    
    await checkSupabaseConnection();
    
    try {
        await connectToMongoDB();
    } catch (err) {
        console.error("❌ Falha ao iniciar o Servidor do MongoDB", err);
    }
});