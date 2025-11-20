import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json());

// Static file serving for uploads
app.use('/uploads', express.static('uploads'));

// API Routes
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => res.json({ status: 'ok' }));

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
