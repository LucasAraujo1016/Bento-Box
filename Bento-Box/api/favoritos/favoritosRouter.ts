import express from 'express';
import Favorito from './favoritos';

const router = express.Router();

router.post('/toggle', async (req, res) => {
    const { usuarioId, receitaId } = req.body;

    try {
        const existente = await Favorito.findOne({ usuarioId, receitaId });
        
        if (existente) {
            await Favorito.deleteOne({ _id: existente._id });
            res.status(200).json({ message: 'Removido dos favoritos', action: 'removed' });
        } else {
            const novoFavorito = new Favorito({ usuarioId, receitaId });
            await novoFavorito.save();
            res.status(201).json({ message: 'Adicionado aos favoritos', action: 'added' });
        }
    } catch (error) {
        console.error('Erro ao favoritar receita:', error);
        res.status(500).json({ error: 'Erro interno ao processar favorito' });
    }
});

router.get('/:usuarioId', async (req, res) => {
    const { usuarioId } = req.params;

    try {
        const favoritos = await Favorito.find({ usuarioId }).populate('receitaId');
        
        const receitas = favoritos.map(f => f.receitaId).filter(receita => receita != null);
        
        res.status(200).json(receitas);
    } catch (error) {
        console.error('Erro ao buscar favoritos:', error);
        res.status(500).json({ error: 'Erro ao buscar as receitas favoritas.' });
    }
});

export default router;