import mongoose from 'mongoose';

const HistoricoSchema = new mongoose.Schema({
    usuarioId: { type: String, required: true, index: true },
    receitaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Receita', required: true },
    dataFeita: { type: Date, default: Date.now }
}, {
    collection: 'historicos'
});

export const Historico = mongoose.models.Historico || mongoose.model('Historico', HistoricoSchema);