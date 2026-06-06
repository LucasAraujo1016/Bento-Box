import mongoose from 'mongoose';

const IngredienteSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  quantidade: { type: String, required: true }
}, { _id: false });

/**
 * Cada passo do modo de preparo agora pode ter um timer em minutos definido
 * pelo autor da receita. `timerMinutos: null` significa sem timer para aquele passo.
 *
 * Retrocompatibilidade: a API continua aceitando strings simples — o router
 * pode normalizar antes de salvar, ou o front-end trata ambos os formatos.
 */
const PassoPreparoSchema = new mongoose.Schema({
  texto: { type: String, required: true },
  timerMinutos: { type: Number, default: null }  // null = sem timer
}, { _id: false });

const ReceitaSchema = new mongoose.Schema({
  autorId: { type: String, required: true, index: true },
  autorNome: { type: String },
  nome: { type: String, required: true },
  imagem: { type: String },
  descricao: { type: String, required: true },
  tempoPreparo: { type: Number, required: true },

  nivelHabilidade: {
    type: String,
    enum: ['iniciante', 'intermediario', 'profissional'],
    required: true
  },

  tipoCulinaria: { type: String, required: true },

  restricoes: [{ type: String }],

  ingredientes: [IngredienteSchema],

  // Agora armazena objetos { texto, timerMinutos } em vez de strings simples
  modoPreparo: [PassoPreparoSchema],

  criadoEm: { type: Date, default: Date.now }
}, {
  collection: 'receitas'
});

export const Receita = mongoose.models.Receita || mongoose.model('Receita', ReceitaSchema);