import { Router, Request, Response } from 'express';
import supabase from './database/supabaseClient';

const loginRouter = Router();

interface LoginRequestBody {
    email: string;
    senha: string;
}

loginRouter.post('/', async (req: Request, res: Response): Promise<any> => {
    const body = req.body as LoginRequestBody;

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: body.email,
            password: body.senha,
        });

        if (error) {
            return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
        }

        return res.status(200).json({
            mensagem: 'Login realizado com sucesso',
            token: data.session.access_token,        
            refreshToken: data.session.refresh_token, 
            expiresIn: data.session.expires_in,  
            usuario: data.user
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
});

export default loginRouter;