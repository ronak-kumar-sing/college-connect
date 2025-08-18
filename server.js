// server.js - Socket.io server for real-time messaging
const { createServer } = require('http');
const { Server } = require('socket.io');
const next = require('next');
const jwt = require('jsonwebtoken');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

// Store active users and their socket connections
const activeUsers = new Map(); // userId -> { socketId, userInfo }
const userSockets = new Map(); // socketId -> userId

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === 'production'
        ? process.env.NEXT_PUBLIC_BASE_URL
        : "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Socket.io middleware for authentication
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (err) {
      console.error('Socket authentication error:', err.message);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    console.log(`User ${userId} connected with socket ${socket.id}`);

    // Store user connection
    activeUsers.set(userId, {
      socketId: socket.id,
      userId: userId,
      lastSeen: new Date()
    });
    userSockets.set(socket.id, userId);

    // Join user to their personal room for private messages
    socket.join(`user:${userId}`);

    // Broadcast user online status
    socket.broadcast.emit('user:online', { userId, lastSeen: new Date() });

    // Handle joining conversation rooms
    socket.on('join:conversation', (conversationId) => {
      socket.join(`conversation:${conversationId}`);
      console.log(`User ${userId} joined conversation ${conversationId}`);
    });

    // Handle leaving conversation rooms
    socket.on('leave:conversation', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(`User ${userId} left conversation ${conversationId}`);
    });

    // Handle new message
    socket.on('message:send', (data) => {
      const { conversationId, message } = data;

      // Broadcast message to all participants in the conversation
      socket.to(`conversation:${conversationId}`).emit('message:receive', {
        ...message,
        sender: {
          id: userId,
          ...message.sender
        }
      });

      console.log(`Message sent in conversation ${conversationId} by user ${userId}`);
    });

    // Handle typing indicators
    socket.on('typing:start', (data) => {
      const { conversationId, userName } = data;
      socket.to(`conversation:${conversationId}`).emit('typing:start', {
        userId,
        userName,
        conversationId
      });
    });

    socket.on('typing:stop', (data) => {
      const { conversationId } = data;
      socket.to(`conversation:${conversationId}`).emit('typing:stop', {
        userId,
        conversationId
      });
    });

    // Handle message read receipts
    socket.on('message:read', (data) => {
      const { conversationId, messageId } = data;
      socket.to(`conversation:${conversationId}`).emit('message:read', {
        messageId,
        userId,
        readAt: new Date()
      });
    });

    // Handle user status updates
    socket.on('status:update', (status) => {
      const userInfo = activeUsers.get(userId);
      if (userInfo) {
        userInfo.status = status;
        userInfo.lastSeen = new Date();
        activeUsers.set(userId, userInfo);
      }

      socket.broadcast.emit('user:status', { userId, status, lastSeen: new Date() });
    });

    // Handle getting online users
    socket.on('users:online', (callback) => {
      const onlineUsers = Array.from(activeUsers.values());
      callback(onlineUsers);
    });

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      console.log(`User ${userId} disconnected: ${reason}`);

      // Remove user from active users
      activeUsers.delete(userId);
      userSockets.delete(socket.id);

      // Broadcast user offline status
      socket.broadcast.emit('user:offline', {
        userId,
        lastSeen: new Date(),
        reason
      });
    });

    // Handle connection errors
    socket.on('error', (error) => {
      console.error(`Socket error for user ${userId}:`, error);
    });
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port} with Socket.io support`);
    });
});
