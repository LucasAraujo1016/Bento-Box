import express from 'express';
import Favorito from './favoritos';

const router = express.Router();

// Rota para alternar (Marcar / Desmarcar) o favorito
router.post('/toggle', async (req, res) => {
    const { usuarioId, receitaId } = req.body;

    try {
        const existente = await Favorito.findOne({ usuarioId, receitaId });
        
        if (existente) {
            // Se já está favoritado, remove (desmarca)
            await Favorito.deleteOne({ _id: existente._id });
            res.status(200).json({ message: 'Removido dos favoritos', action: 'removed' });
        } else {
            // Se não está, adiciona
            const novoFavorito = new Favorito({ usuarioId, receitaId });
            await novoFavorito.save();
            res.status(201).json({ message: 'Adicionado aos favoritos', action: 'added' });
        }
    } catch (error) {
        console.error('Erro ao favoritar receita:', error);
        res.status(500).json({ error: 'Erro interno ao processar favorito' });
    }
});

// Rota para resgatar todas as receitas favoritas do usuário
router.get('/:usuarioId', async (req, res) => {
    const { usuarioId } = req.params;

    try {
        // Busca os registros e popula com os dados reais da Receita
        const favoritos = await Favorito.find({ usuarioId }).populate('receitaId');
        
        // Extrai apenas o objeto da receita do documento populado, tirando valores nulos se a receita foi apagada do banco
        const receitas = favoritos.map(f => f.receitaId).filter(receita => receita != null);
        
        res.status(200).json(receitas);
    } catch (error) {
        console.error('Erro ao buscar favoritos:', error);
        res.status(500).json({ error: 'Erro ao buscar as receitas favoritas.' });
    }
});

export default router;