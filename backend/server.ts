import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './db';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Initialize Database Layer
db.init().then(() => {
  console.log('Database backend successfully initialized.');
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_pr', async (prId) => {
    socket.join(`pr_${prId}`);
    try {
      const annotations = await db.getAnnotations(prId);
      socket.emit('sync_annotations', annotations);
    } catch (err) {
      console.error('Error fetching annotations on join:', err);
      socket.emit('sync_annotations', []);
    }
  });

  socket.on('add_annotation', async ({ prId, annotation }) => {
    try {
      const savedAnnotation = await db.saveAnnotation(prId, {
        id: annotation.id || Date.now(),
        line: annotation.line !== undefined ? annotation.line : null,
        user: annotation.user || 'Collaborator',
        text: annotation.text,
        timestamp: annotation.timestamp || new Date().toISOString(),
      });
      io.to(`pr_${prId}`).emit('new_annotation', savedAnnotation);
    } catch (err) {
      console.error('Error saving annotation:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Mock OAuth endpoint
app.post('/api/auth/github', (req, res) => {
  res.json({ token: 'mock_github_token_123', user: { login: 'mockuser', name: 'DevPulse Sandbox User' } });
});

// Real Database Analytics Endpoint
app.get('/api/analytics', async (req, res) => {
  try {
    const metrics = await db.getMetrics();
    res.json(metrics);
  } catch (err) {
    console.error('Error loading analytics:', err);
    res.status(500).json({ error: 'Failed to retrieve database metrics.' });
  }
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
