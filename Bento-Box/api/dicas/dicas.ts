// api/dicas.ts
import mongoose from 'mongoose';

const DicaSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  conteudo: { type: String, required: true },
  criadoEm: { type: Date, default: Date.now }
}, {
  collection: 'dicas'
});

// Evita recriar o modelo se ele já estiver registrado, e exporta
export const Dica = mongoose.models.Dica || mongoose.model('Dica', DicaSchema);