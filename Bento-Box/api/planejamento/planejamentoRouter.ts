import { Router, Request, Response } from 'express';
import { Receita } from '../receitas/receitas';
import supabase from '../database/supabaseClient'; 
import { Planejamento } from './planejamento'; // Importando o modelo de Planejamento

const planejamentoRouter = Router();

const construirFiltros = (usuario: any) => {
    const matchFiltros: any = {};
    if (usuario.restricoes && usuario.restricoes.length > 0) {
        matchFiltros.restricoes = { $all: usuario.restricoes };
    }
    const hierarquiaNivel: Record<string, string[]> = {
        'iniciante': ['iniciante'],
        'intermediario': ['iniciante', 'intermediario'],
        'profissional': ['iniciante', 'intermediario', 'profissional']
    };
    const nivelUsuario = usuario.nivel_habilidade ? usuario.nivel_habilidade.toLowerCase() : 'iniciante';
    const niveisPermitidos = hierarquiaNivel[nivelUsuario] || ['iniciante']; 
    matchFiltros.nivelHabilidade = { $in: niveisPermitidos };
    return matchFiltros;
};

// 1. GERAR CARDÁPIO AUTO
planejamentoRouter.get('/gerar', async (req: Request, res: Response) => {
    try {
        const userId = req.query.userId as string;
        if (!userId) return res.status(400).json({ message: 'User ID é obrigatório' });

        const { data: usuario, error } = await supabase.from('usuarios').select('*').eq('id', userId).single();
        if (error || !usuario) return res.status(404).json({ message: 'Usuário não encontrado' });

        const matchFiltros = construirFiltros(usuario);
        const receitasRecomendadas = await Receita.aggregate([{ $match: matchFiltros }, { $sample: { size: 14 } }]);

        const dias = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];
        const cardapioFrontEnd: { [key: string]: any[] } = {};
        dias.forEach(d => cardapioFrontEnd[d] = []);

        if (receitasRecomendadas.length === 0) return res.status(200).json(cardapioFrontEnd);

        let receitasPool = [...receitasRecomendadas];
        for (let i = 0; i < 7; i++) {
            const dia = dias[i];
            if (receitasPool.length === 0) receitasPool = [...receitasRecomendadas];
            const rec = receitasPool.shift();
            cardapioFrontEnd[dia].push({ ...rec, id: rec._id.toString() });
        }
        let indexDia = 0;
        while (receitasPool.length > 0 && indexDia < 7) {
            const dia = dias[indexDia];
            const rec = receitasPool.shift();
            cardapioFrontEnd[dia].push({ ...rec, id: rec._id.toString() });
            indexDia++;
        }
        return res.status(200).json(cardapioFrontEnd);
    } catch { return res.status(500).json({ message: 'Erro interno' }); }
});

// 2. SUGESTÕES (ADICIONAR MANUAL)
planejamentoRouter.get('/sugestoes', async (req: Request, res: Response) => {
    try {
        const userId = req.query.userId as string;
        if (!userId) return res.status(400).json({ message: 'User ID é obrigatório' });

        const { data: usuario, error } = await supabase.from('usuarios').select('*').eq('id', userId).single();
        if (error || !usuario) return res.status(404).json({ message: 'Usuário não encontrado' });

        const matchFiltros = construirFiltros(usuario);
        const sugestoes = await Receita.find(matchFiltros).limit(30);

        return res.status(200).json(sugestoes.map(rec => ({ ...rec.toObject(), id: rec._id.toString() })));
    } catch { return res.status(500).json({ message: 'Erro interno' }); }
});

// --- NOVAS ROTAS DE BANCO DE DADOS (MONOGODB - MODELO PLANEJAMENTO) ---

// 3. OBTER TODOS OS PLANEJAMENTOS DO USUÁRIO
planejamentoRouter.get('/lista', async (req: Request, res: Response) => {
    try {
        const userId = req.query.userId as string;
        const planos = await Planejamento.find({ usuarioId: userId }).sort({ atualizacaoDts: -1 });
        res.status(200).json(planos);
    } catch(err) { res.status(500).json({ error: err }); }
});

// 4. SALVAR NOVO
planejamentoRouter.post('/', async (req: Request, res: Response) => {
    try {
        const { usuarioId, nome, cardapio } = req.body;
        
        // Verifica se já existe um plano com este nome para este usuário
        const existente = await Planejamento.findOne({ usuarioId, nome });
        if (existente) {
            return res.status(400).json({ message: 'Você já possui um planejamento salvo com esse nome.' });
        }

        const plano = new Planejamento({ usuarioId, nome, cardapio });
        await plano.save();
        res.status(201).json(plano);
    } catch(err) { res.status(500).json({ error: err }); }
});

// 5. ATUALIZAR EXISTENTE
planejamentoRouter.put('/:id', async (req: Request, res: Response) => {
    try {
        const { nome, cardapio, usuarioId } = req.body;

        // Verifica duplicidade no nome apenas se o ID não for o mesmo que estamos editando
        const existente = await Planejamento.findOne({ usuarioId, nome, _id: { $ne: req.params.id } });
        if (existente) {
            return res.status(400).json({ message: 'Você já possui um planejamento salvo com esse nome.' });
        }

        const plano = await Planejamento.findByIdAndUpdate(req.params.id, { nome, cardapio, atualizacaoDts: new Date() }, { new: true });
        res.json(plano);
    } catch(err) { res.status(500).json({ error: err }); }
});

// 6. EXCLUIR
planejamentoRouter.delete('/:id', async (req: Request, res: Response) => {
    try {
        await Planejamento.findByIdAndDelete(req.params.id);
        res.json({ message: "Deletado com sucesso" });
    } catch(err) { res.status(500).json({ error: err }); }
});

export default planejamentoRouter;