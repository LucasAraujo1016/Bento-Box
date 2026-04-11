import { Router, Request, Response } from 'express';
import supabase from './database/supabaseClient'; // Ajuste o caminho se a pasta database estiver em outro local

const cadastroRouter = Router();

interface CadastroRequestBody {
    email: string;
    senha: string;
    nomeUsuario: string;
    culinariaFavorita: string;
    nivelHabilidade: string;
    restricoes: string[];
}

cadastroRouter.post('/', async (req: Request, res: Response): Promise<any> => {
    const body = req.body as CadastroRequestBody;

    try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: body.email,
            password: body.senha,
        });

        if (authError) {
            return res.status(400).json({ erro: authError.message });
        }

        const userId = authData.user?.id;
        
        if (!userId) {
            return res.status(400).json({ erro: "Erro ao obter ID do usuário" });
        }

        const { error: dbError } = await supabase
            .from('usuarios')
            .insert([
                {
                    id: userId,
                    nome_usuario: body.nomeUsuario,
                    email: body.email,
                    culinaria_favorita: body.culinariaFavorita,
                    nivel_habilidade: body.nivelHabilidade,
                    restricoes: body.restricoes
                }
            ]);

        if (dbError) {
            return res.status(500).json({ erro: 'Conta criada, erro no perfil: ' + dbError.message });
        }

        return res.status(201).json({ 
            mensagem: 'Usuário cadastrado com sucesso!', 
            usuarioId: userId 
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
});

export default cadastroRouter;