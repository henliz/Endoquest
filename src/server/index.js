import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import aiRoutes from './routes/ai.js';
import playerDataRoutes from './routes/playerData.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'EndoQuest backend is running' });
});

// Routes
app.use('/api/ai', aiRoutes);
app.use('/api/player', playerDataRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🎮 EndoQuest backend running on http://localhost:${PORT}`);
  console.log(`📡 Accepting requests from: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});
