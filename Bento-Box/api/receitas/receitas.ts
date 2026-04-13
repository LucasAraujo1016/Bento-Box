import mongoose from 'mongoose';

const IngredienteSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  quantidade: { type: String, required: true }
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
  
  modoPreparo: [{ type: String, required: true }],
  
  criadoEm: { type: Date, default: Date.now }
}, { 
  collection: 'receitas' 
});

export const Receita = mongoose.models.Receita || mongoose.model('Receita', ReceitaSchema);