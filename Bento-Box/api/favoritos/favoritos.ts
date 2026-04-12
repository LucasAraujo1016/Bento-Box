import mongoose, { Schema, Document } from 'mongoose';

export interface IFavorito extends Document {
    usuarioId: string;
    receitaId: mongoose.Types.ObjectId;
    dataFavoritado: Date;
}

const FavoritoSchema: Schema = new Schema({
    usuarioId: { type: String, required: true },
    receitaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Receita', required: true }, // 'Receitas' deve ser o nome exato do seu model de receita
    dataFavoritado: { type: Date, default: Date.now }
});

// Impede re-compilação do model caso este arquivo seja lido múltiplas vezes
export default mongoose.models.Favorito || mongoose.model<IFavorito>('Favorito', FavoritoSchema);