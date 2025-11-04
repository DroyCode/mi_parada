import { Schema, model, Document } from 'mongoose';
import { TransportType } from './enums';

export interface ITime extends Document {
  stop: Schema.Types.ObjectId;
  syndicate?: Schema.Types.ObjectId;
  transportName: string;
  transportType: TransportType;
  arrivalTime: Date;
  notes?: string;
}

const TimeSchema = new Schema<ITime>({
  stop: { type: Schema.Types.ObjectId, ref: 'Stop', required: true },
  syndicate: { type: Schema.Types.ObjectId, ref: 'Syndicate' },
  transportName: { type: String, required: true },
  transportType: { type: Number, enum: [0, 1], required: true },
  arrivalTime: { type: Date, required: true }, // puedes adaptar a string "HH:mm" si prefieres
  notes: String,
}, { timestamps: true });

export const Time = model<ITime>('Time', TimeSchema);
