import mongoose from 'mongoose';

const planejamentoSchema = new mongoose.Schema({
    usuarioId: { type: String, required: true },
    nome: { type: String, required: true }, 
    cardapio: { type: Object, required: true }, 
    atualizacaoDts: { type: Date, default: Date.now } 
});

export const Planejamento = mongoose.model('Planejamento', planejamentoSchema);