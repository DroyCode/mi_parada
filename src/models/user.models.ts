import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name?: string;
  passwordHash?: string;
  role?: 'user' | 'admin';
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  name: String,
  passwordHash: String,
  role: { type: String, default: 'user' },
}, { timestamps: true });

export const User = model<IUser>('User', UserSchema);
