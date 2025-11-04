import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';
import stopsRoutes from './routes/stops.routes';
import syndicatesRoutes from './routes/syndicates.routes';
import timesRoutes from './routes/times.routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/stops', stopsRoutes);
app.use('/api/syndicates', syndicatesRoutes);
app.use('/api/times', timesRoutes);

app.get('/', (req, res) => res.send({ name: 'Mi Parada API', version: '1.0.0' }));

app.use(errorHandler);

export default app;
