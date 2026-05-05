import { Router, Request, Response } from 'express';
import { Receita } from '../receitas/receitas';
import supabase from '../database/supabaseClient'; 

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

planejamentoRouter.get('/gerar', async (req: Request, res: Response) => {
    try {
        const userId = req.query.userId as string;
        if (!userId) return res.status(400).json({ message: 'User ID é obrigatório' });

        const { data: usuario, error } = await supabase
            .from('usuarios')
            .select('restricoes, culinaria_favorita, nivel_habilidade')
            .eq('id', userId)
            .single();

        if (error || !usuario) return res.status(404).json({ message: 'Usuário não encontrado', error });

        const matchFiltros = construirFiltros(usuario);

        const receitasRecomendadas = await Receita.aggregate([
            { $match: matchFiltros },
            { $sample: { size: 14 } } 
        ]);

        const dias = [
            'Segunda-feira', 'Terça-feira', 'Quarta-feira', 
            'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'
        ];
        const cardapioFrontEnd: { [key: string]: any[] } = {};
        dias.forEach(d => cardapioFrontEnd[d] = []);

        if (receitasRecomendadas.length === 0) {
            return res.status(200).json(cardapioFrontEnd);
        }

        let receitasPool = [...receitasRecomendadas];
        
        for (let i = 0; i < 7; i++) {
            const dia = dias[i];
            
            if (receitasPool.length === 0) {
                receitasPool = [...receitasRecomendadas];
            }
            
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

    } catch (error: any) {
        console.error('Erro ao gerar cardápio: ', error);
        return res.status(500).json({ message: 'Erro interno ao gerar cardápio', detalhes: error.message });
    }
});

planejamentoRouter.get('/sugestoes', async (req: Request, res: Response) => {
    try {
        const userId = req.query.userId as string;
        if (!userId) return res.status(400).json({ message: 'User ID é obrigatório' });

        const { data: usuario, error } = await supabase
            .from('usuarios')
            .select('restricoes, culinaria_favorita, nivel_habilidade')
            .eq('id', userId)
            .single();

        if (error || !usuario) return res.status(404).json({ message: 'Usuário não encontrado', error });

        const matchFiltros = construirFiltros(usuario);
        
        const sugestoes = await Receita.find(matchFiltros).limit(30);

        const sugestoesFormatadas = sugestoes.map(rec => ({
            ...rec.toObject(),
            id: rec._id.toString()
        }));

        return res.status(200).json(sugestoesFormatadas);
    } catch (error: any) {
        console.error('Erro ao buscar sugestões: ', error);
        return res.status(500).json({ message: 'Erro interno ao buscar sugestões' });
    }
});

export default planejamentoRouter;