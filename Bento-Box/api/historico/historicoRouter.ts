import { Router, Request, Response } from 'express';
import { Historico } from './historico';
import { Receita } from '../receitas/receitas'; // Precisamos importar para o "populate" entender a relação

const router = Router();

// [POST] Marcar / Desmarcar como feita
router.post('/toggle', async (req: Request, res: Response): Promise<any> => {
    const { usuarioId, receitaId } = req.body;

    try {
        const existente = await Historico.findOne({ usuarioId, receitaId });

        if (existente) {
            // Se encontrou, significa que a receita já foi desmarcada
            await Historico.deleteOne({ _id: existente._id });
            return res.status(200).json({ mensagem: 'Removido do histórico', feita: false });
        } else {
            // Se não encontrou, salva no histórico
            const novo = new Historico({ usuarioId, receitaId });
            await novo.save();
            return res.status(201).json({ mensagem: 'Adicionado ao histórico', feita: true });
        }
    } catch (error: any) {
        console.error("Erro no toggle de histórico:", error);
        return res.status(500).json({ erro: 'Erro ao alterar histórico', detalhe: error.message });
    }
});

// [GET] Buscar o histórico do usuário
router.get('/:usuarioId', async (req: Request, res: Response): Promise<any> => {
    const { usuarioId } = req.params;

    try {
        const historico = await Historico.find({ usuarioId })
            .sort({ dataFeita: -1 }) // Ordena caindo (-1): da mais recente pra mais antiga
            .populate({ path: 'receitaId', model: Receita }) // Puxa os detalhes completos da receita
            .exec();

        // O resultado vai vir como um array de objetos históricos, mas o frontend só quer as Receitas
        // Vamos extrair as receitas e limpar os nulos caso alguma receita tenha sido apagada do banco:
        const receitasFeitas = historico.map(h => h.receitaId).filter(r => r != null);

        return res.status(200).json(receitasFeitas);
    } catch (error: any) {
        console.error("Erro ao buscar histórico:", error);
        return res.status(500).json({ erro: 'Erro ao buscar histórico', detalhe: error.message });
    }
});

export default router;