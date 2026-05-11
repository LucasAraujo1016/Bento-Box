import { Router, Request, Response } from 'express';
import { Receita } from './receitas'; 

const receitasRouter = Router();

receitasRouter.get('/', async (req: Request, res: Response) => {
    try {
        const listaReceitas = await Receita.find().sort({ criadoEm: -1 }); 
        return res.status(200).json(listaReceitas);
    } catch (error: any) {
        return res.status(500).json({ message: 'Erro interno', detalhes: error.message });
    }
});

receitasRouter.get('/autor/:autorId/count', async (req: Request, res: Response) => {
    try {
        const { autorId } = req.params;
        const total = await Receita.countDocuments({ autorId: autorId });
        return res.status(200).json({ total });
    } catch (error: any) {
        return res.status(500).json({ message: 'Erro interno ao contar receitas.', detalhes: error.message });
    }
});

receitasRouter.post('/', async (req: Request, res: Response) => {
    try {
        const novaReceita = new Receita(req.body);
        const receitaSalva = await novaReceita.save();
        return res.status(201).json({ mensagem: 'Receita criada com sucesso!', receita: receitaSalva });
    } catch (error: any) {
        return res.status(400).json({ message: 'Erro ao criar receita.', detalhes: error.message });
    }
});

export default receitasRouter;