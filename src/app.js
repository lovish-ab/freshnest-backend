import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';


const app = express();
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => res.json({ status: 'ok' }));

export default app;
