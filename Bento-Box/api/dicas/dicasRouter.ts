// api/dicasRouter.ts
import { Router } from 'express';
import { Dica } from './dicas';

const router = Router();

// Rota GET para buscar todas as dicas
router.get('/', async (req, res) => {
    try {
        const dicas = await Dica.find();
        return res.status(200).json(dicas);
    } catch (error: any) {
        console.error("Erro ao buscar dicas:", error);
        return res.status(500).json({ message: "Erro ao buscar as dicas", error: error.message });
    }
});

// Opcional: Rota POST para adicionar novas dicas via Postman/Insomnia pra facilitar no futuro
router.post('/', async (req, res) => {
    try {
        const novasDicas = req.body;
        
        // Permite inserir tanto um array de dicas (várias de uma vez) quanto uma única
        const dicasSalvas = await Dica.insertMany(Array.isArray(novasDicas) ? novasDicas : [novasDicas]);
        return res.status(201).json(dicasSalvas);
    } catch (error: any) {
        return res.status(500).json({ message: "Erro ao salvar dica", error: error.message });
    }
});

export default router;