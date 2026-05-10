import { Router } from 'express';
import { Despensa } from './despensa';

const despensaRouter = Router();

despensaRouter.get('/:usuarioId', async (req, res) => {
    try {
        const itens = await Despensa.find({ usuarioId: req.params.usuarioId });
        res.json(itens);
    } catch {
        res.status(500).json({ message: "Erro ao buscar despensa" });
    }
});

despensaRouter.post('/', async (req, res) => {
    try {
        const { usuarioId, nomeItem, quantidade = 1 } = req.body;
        if (!usuarioId || !nomeItem) {
            return res.status(400).json({ message: "Dados incompletos" });
        }
        
        const normalizeString = (str: string) => 
            str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
            
        const nomeNormalizado = normalizeString(nomeItem);
        
        const itensUsuario = await Despensa.find({ usuarioId });
        const itemExistente = itensUsuario.find(i => normalizeString(i.nomeItem) === nomeNormalizado);

        if (itemExistente) {
            itemExistente.quantidade = (itemExistente.quantidade || 0) + quantidade;
            const itemSalvo = await itemExistente.save();
            return res.status(200).json(itemSalvo); 
        } else {
            const novoItem = new Despensa({ usuarioId, nomeItem: nomeItem.trim(), quantidade });
            const itemSalvo = await novoItem.save();
            return res.status(201).json(itemSalvo);
        }
    } catch {
        res.status(500).json({ message: "Erro ao adicionar item" });
    }
});

despensaRouter.put('/:id', async (req, res) => {
    try {
        const { quantidade } = req.body;
        const itemAtualizado = await Despensa.findByIdAndUpdate(
            req.params.id, 
            { quantidade }, 
            { new: true }
        );

        if (itemAtualizado) {
            res.status(200).json(itemAtualizado);
        } else {
            res.status(404).json({ message: "Item não encontrado." });
        }
    } catch {
        res.status(500).json({ message: "Erro ao atualizar quantidade" });
    }
});

despensaRouter.delete('/:id', async (req, res) => {
    try {
        const resultado = await Despensa.deleteOne({ _id: req.params.id });
        if (resultado.deletedCount > 0) {
            res.status(200).json({ message: "Item removido" });
        } else {
            res.status(404).json({ message: "Item não encontrado" });
        }
    } catch {
        res.status(500).json({ message: "Erro ao remover item" });
    }
});

export default despensaRouter;