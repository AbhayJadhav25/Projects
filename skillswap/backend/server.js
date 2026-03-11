const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const { startAccountActivationJob } = require('./jobs/accountActivation');

// Route imports
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const messageRoutes = require('./routes/messages');
const postRoutes = require('./routes/posts');
const resourceRoutes = require('./routes/resources');

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/resources', resourceRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

// ── Socket.IO Real-time Chat ──────────────────────────────────────────────────
const onlineUsers = new Map(); // userId -> socketId

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // User joins with their userId
  socket.on('user_connected', (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit('online_users', Array.from(onlineUsers.keys()));
  });

  // Join a conversation room
  socket.on('join_conversation', (conversationId) => {
    socket.join(conversationId);
  });

  // Send message via socket
  socket.on('send_message', (data) => {
    const { conversationId, message } = data;
    socket.to(conversationId).emit('receive_message', message);
  });

  // Typing indicator
  socket.on('typing', ({ conversationId, userId }) => {
    socket.to(conversationId).emit('user_typing', { userId });
  });

  socket.on('stop_typing', ({ conversationId, userId }) => {
    socket.to(conversationId).emit('user_stop_typing', { userId });
  });

  // Meet link generated
  socket.on('meet_link_generated', (data) => {
    const { conversationId, meetLink, message } = data;
    socket.to(conversationId).emit('receive_meet_link', { meetLink, message });
  });

  socket.on('disconnect', () => {
    onlineUsers.forEach((sId, userId) => {
      if (sId === socket.id) onlineUsers.delete(userId);
    });
    io.emit('online_users', Array.from(onlineUsers.keys()));
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Start background jobs
startAccountActivationJob();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`SkillSwap server running on port ${PORT}`);
  console.log(`Socket.IO enabled`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});


