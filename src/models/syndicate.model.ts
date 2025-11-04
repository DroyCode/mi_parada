import { Schema, model, Document } from 'mongoose';

export interface ISyndicate extends Document {
  name: string;
  contact?: string;
}

const SyndicateSchema = new Schema<ISyndicate>({
  name: { type: String, required: true },
  contact: String,
}, { timestamps: true });

export const Syndicate = model<ISyndicate>('Syndicate', SyndicateSchema);
