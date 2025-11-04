import { Schema, model, Document } from 'mongoose';

export interface IStop extends Document {
  name: string;
  location?: { lat: number; lng: number; };
  address?: string;
}

const StopSchema = new Schema<IStop>({
  name: { type: String, required: true },
  location: {
    lat: Number,
    lng: Number,
  },
  address: String,
}, { timestamps: true });

export const Stop = model<IStop>('Stop', StopSchema);
