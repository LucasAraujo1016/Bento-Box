import { Router } from 'express';
import { Dica } from './dicas';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const dicas = await Dica.find();
        return res.status(200).json(dicas);
    } catch (error: any) {
        console.error("Erro ao buscar dicas:", error);
        return res.status(500).json({ message: "Erro ao buscar as dicas", error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const novasDicas = req.body;
        
        const dicasSalvas = await Dica.insertMany(Array.isArray(novasDicas) ? novasDicas : [novasDicas]);
        return res.status(201).json(dicasSalvas);
    } catch (error: any) {
        return res.status(500).json({ message: "Erro ao salvar dica", error: error.message });
    }
});

export default router;