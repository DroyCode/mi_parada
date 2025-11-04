// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import dotenv from 'dotenv';
import jwt, { Secret } from 'jsonwebtoken';
dotenv.config();

export interface AuthRequest extends Request {
  user?: any;
}

/* ---------- Environment (use bracket access to avoid index-signature complaints) ---------- */
const STRATEGY = process.env['AUTH_STRATEGY'] || 'manual';
const FIREBASE_CREDENTIALS_PATH = process.env['FIREBASE_CREDENTIALS_PATH'];

/* ---------- Fail-fast checks at startup ---------- */
if (STRATEGY === 'manual' && !process.env['JWT_SECRET']) {
  throw new Error('JWT_SECRET must be set in .env when using manual auth');
}
if (STRATEGY === 'firebase' && !FIREBASE_CREDENTIALS_PATH) {
  throw new Error('FIREBASE_CREDENTIALS_PATH must be set in .env when using firebase auth');
}

/* ---------- Safe read of JWT secret (guaranteed by fail-fast above for manual strategy) ---------- */
const JWT_SECRET: string | undefined = process.env['JWT_SECRET'];

/* ---------- Conditional firebase-admin import/init ---------- */
let admin: typeof import('firebase-admin') | null = null;
if (STRATEGY === 'firebase') {
  // require dynamically so projects that don't install firebase-admin won't fail TS resolution at build
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

/* ---------- Manual JWT auth (declared before exported requireAuth to avoid hoisting issues) ---------- */
function manualAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  // Narrow runtime check: secret must be defined
  const secret = JWT_SECRET;
  if (!secret) {
    // Shouldn't happen because of fail-fast, but guard anyway
    return res.status(500).json({ message: 'Server misconfigured: JWT_SECRET missing' });
  }

  try {
    // Cast to jsonwebtoken.Secret (string | Buffer)
    const payload = jwt.verify(token, secret as Secret);
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

/* ---------- Firebase auth (uses local narrowing variable to satisfy TS) ---------- */
async function firebaseAuth(req: AuthRequest, res: Response, next: NextFunction) {
  if (!admin) {
    return res.status(500).json({ message: 'Firebase admin not initialized' });
  }

  // assign to local var so TS understands it is not null
  const firebaseAdmin = admin;

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = await firebaseAdmin.auth().verifyIdToken(token);
    req.user = { uid: decoded.uid, email: decoded.email };
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido (Firebase)' });
  }
}

/* ---------- Exported middleware that selects strategy ---------- */
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  if (STRATEGY === 'firebase') return firebaseAuth(req, res, next);
  return manualAuth(req, res, next);
}
