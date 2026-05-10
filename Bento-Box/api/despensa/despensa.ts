import mongoose, { Schema, Document } from 'mongoose';

export interface IDespensa extends Document {
    usuarioId: string;
    nomeItem: string;
    quantidade: number;
    dataAdicao: Date;
}

const DespensaSchema: Schema = new Schema({
    usuarioId: { type: String, required: true, index: true },
    nomeItem: { type: String, required: true },
    quantidade: { type: Number, required: true, default: 1 },
    dataAdicao: { type: Date, default: Date.now }
}, {
    collection: 'despensa'
});

export const Despensa = mongoose.models.Despensa || mongoose.model<IDespensa>('Despensa', DespensaSchema);