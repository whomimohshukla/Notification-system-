import http from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Server as SocketIOServer } from 'socket.io';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.js';
import notificationRoutes from './routes/notifications.js';
import { authenticateSocket } from './middleware/auth.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: false,
  },
});

// Socket authentication and room join per user
io.use(authenticateSocket);
io.on('connection', (socket) => {
  const { userId } = socket;
  if (userId) {
    socket.join(`user:${userId}`);
  }

  socket.on('disconnect', () => {
    // Nothing special needed here yet
  });
});

// Make io available in routes via request
app.use((req, _res, next) => {
  req.io = io;
  next();
});

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/notifications_demo';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    server.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();
