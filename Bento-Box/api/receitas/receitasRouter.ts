import { Router, Request, Response } from 'express';
import { Receita } from './receitas'; 

const receitasRouter = Router();

// 1. Rota GET: Retorna todas as receitas cadastradas
receitasRouter.get('/', async (req: Request, res: Response) => {
    try {
        // Traz todas as receitas do banco, ordenando da mais nova para a mais antiga
        const listaReceitas = await Receita.find().sort({ criadoEm: -1 }); 
        return res.status(200).json(listaReceitas);
    } catch (error: any) {
        console.error("Erro ao buscar receitas: ", error);
        return res.status(500).json({ message: 'Erro interno ao buscar receitas.', detalhes: error.message });
    }
});

// 2. Rota POST (mantém como estava)
receitasRouter.post('/', async (req: Request, res: Response) => {
    try {
        const novaReceita = new Receita(req.body);
        const receitaSalva = await novaReceita.save();
        return res.status(201).json({ mensagem: 'Receita criada com sucesso!', receita: receitaSalva });
    } catch (error: any) {
        console.error("Erro ao criar a receita: ", error);
        return res.status(400).json({ message: 'Erro ao criar receita.', detalhes: error.message });
    }
});

export default receitasRouter;