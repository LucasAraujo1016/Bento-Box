import { Router, Request, Response } from 'express';
import supabase from '../database/supabaseClient';

const perfilRouter = Router();

perfilRouter.get('/:id', async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('usuarios')
            .select('nome_usuario, culinaria_favorita, nivel_habilidade, restricoes')
            .eq('id', id)
            .single();

        if (error) {
            return res.status(404).json({ erro: 'Usuário não encontrado.' });
        }

        return res.status(200).json(data);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
});

perfilRouter.put('/:id', async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const { nome_usuario, culinaria_favorita, nivel_habilidade, restricoes } = req.body;

        const { data, error } = await supabase
            .from('usuarios')
            .update({
                nome_usuario,
                culinaria_favorita,
                nivel_habilidade,
                restricoes
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return res.status(400).json({ erro: 'Erro ao atualizar o perfil: ' + error.message });
        }

        return res.status(200).json({ mensagem: 'Perfil atualizado com sucesso!', data });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
});

export default perfilRouter;