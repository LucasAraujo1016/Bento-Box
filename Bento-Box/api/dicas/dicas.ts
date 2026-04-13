import mongoose from 'mongoose';

const DicaSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  conteudo: { type: String, required: true },
  criadoEm: { type: Date, default: Date.now }
}, {
  collection: 'dicas'
});

export const Dica = mongoose.models.Dica || mongoose.model('Dica', DicaSchema);