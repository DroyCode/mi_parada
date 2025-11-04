import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/user.models';

type UserRegisterBody = { name?: string; email?: string; password?: string };
type UserLoginBody = { email?: string; password?: string };
type UserUpdateBody = Partial<Pick<IUser, 'name' | 'email' | 'passwordHash'>>;


export async function listUsers(req: Request, res: Response) {
  const users = await User.find().select('-passwordHash').lean();
  return res.json(users);
}


export async function getUser(req: Request<{ id: string }>, res: Response) {
  const { id } = req.params;
  const user = await User.findById(id).select('-passwordHash');
  if (!user) return res.status(404).json({ message: 'User not found' });
  return res.json(user);
}


export async function registerUser(
  req: Request<{}, unknown, UserRegisterBody>,
  res: Response
) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'name, email and password are required' });
  }

  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: 'Email already registered' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash });

  return res.status(201).json({ id: user._id, name: user.name, email: user.email });
}


export async function loginUser(
  req: Request<{}, unknown, UserLoginBody>,
  res: Response
) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'email and password are required' });

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const match = await bcrypt.compare(password, user.passwordHash || '');
  if (!match) return res.status(401).json({ message: 'Invalid credentials' });

  const jwtSecret = process.env.JWT_SECRET as string;
  if (!jwtSecret) return res.status(500).json({ message: 'Server misconfiguration: JWT_SECRET missing' });

  const token = jwt.sign({ id: user._id, email: user.email }, jwtSecret, { expiresIn: '7d' });

  return res.json({
    message: 'Login successful',
    token,
    user: { id: user._id, name: user.name, email: user.email },
  });
}


export async function updateUser(
  req: Request<{ id: string }, unknown, { name?: string; email?: string; password?: string }>,
  res: Response
) {
  const { id } = req.params;
  const { name, email, password } = req.body;

  const updates: Partial<IUser> = {};

  if (name) updates.name = name;
  if (email) updates.email = email;
  if (password) updates.passwordHash = await bcrypt.hash(password, 10);

  const user = await User.findByIdAndUpdate(id, updates, { new: true }).select('-passwordHash');
  if (!user) return res.status(404).json({ message: 'User not found' });

  return res.json(user);
}

 
export async function deleteUser(req: Request<{ id: string }>, res: Response) {
  const { id } = req.params;
  await User.findByIdAndDelete(id);
  return res.status(204).send();
}
