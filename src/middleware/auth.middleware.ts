import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import dotenv from 'dotenv';
import jwt, { Secret } from 'jsonwebtoken';
dotenv.config();

export interface AuthRequest extends Request {
  user?: any;
}

const STRATEGY = process.env['AUTH_STRATEGY'] || 'manual';
const FIREBASE_CREDENTIALS_PATH = process.env['FIREBASE_CREDENTIALS_PATH'];

if (STRATEGY === 'manual' && !process.env['JWT_SECRET']) {
  throw new Error('JWT_SECRET must be set in .env when using manual auth');
}
if (STRATEGY === 'firebase' && !FIREBASE_CREDENTIALS_PATH) {
  throw new Error('FIREBASE_CREDENTIALS_PATH must be set in .env when using firebase auth');
}

const JWT_SECRET: string | undefined = process.env['JWT_SECRET'];

let admin: typeof import('firebase-admin') | null = null;
if (STRATEGY === 'firebase') {
  const firebaseAdmin = require('firebase-admin');

  if (!fs.existsSync(FIREBASE_CREDENTIALS_PATH!)) {
    throw new Error(`Firebase credentials file not found at ${FIREBASE_CREDENTIALS_PATH}`);
  }

  const serviceAccount = JSON.parse(fs.readFileSync(FIREBASE_CREDENTIALS_PATH!, 'utf8'));
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
  });
  admin = firebaseAdmin;
}

function manualAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  const secret = JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ message: 'Server misconfigured: JWT_SECRET missing' });
  }

  try {
    const payload = jwt.verify(token as string, secret as Secret);
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

async function firebaseAuth(req: AuthRequest, res: Response, next: NextFunction) {
  if (!admin) {
    return res.status(500).json({ message: 'Firebase admin not initialized' });
  }

  const firebaseAdmin = admin;

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token not provided or invalid format' });
  }

  try {
    const decoded = await firebaseAdmin.auth().verifyIdToken(token as string);
    req.user = { uid: decoded.uid, email: decoded.email };
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido (Firebase)' });
  }
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  if (STRATEGY === 'firebase') return firebaseAuth(req, res, next);
  return manualAuth(req, res, next);
}
