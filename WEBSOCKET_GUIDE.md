# WebSocket Integration Guide for College Connect

This guide explains how the real-time WebSocket functionality works in College Connect and how to properly connect and use it.

## 🏗️ Architecture Overview

The WebSocket system uses Socket.io for real-time communication between clients and the server:

- **Client**: React components with Socket.io client
- **Server**: Custom Node.js server with Socket.io server
- **Authentication**: JWT tokens for secure connections
- **Storage**: In-memory user tracking + MongoDB for persistence

## 📁 Key Files

```
├── server.js                          # WebSocket server implementation
├── lib/contexts/SocketContext.tsx     # Client-side Socket context
├── lib/hooks/useAuth.ts              # Authentication hook
├── components/messages/               # Real-time messaging components
└── app/api/messages/                 # REST API endpoints
```

## 🔧 Server Setup (server.js)

### 1. Server Configuration

```javascript
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? process.env.NEXT_PUBLIC_BASE_URL
      : "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});
```

### 2. Authentication Middleware

```javascript
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});
```

## 🔌 Client Setup (SocketContext.tsx)

### 1. Connection Initialization

```typescript
useEffect(() => {
  if (user) {
    const token = Cookies.get('token');

    const newSocket = io(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000', {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      setSocket(newSocket);
    });

    return () => newSocket.close();
  }
}, [user]);
```

### 2. Event Handlers

```typescript
// Connection events
newSocket.on('connect', () => console.log('Connected'));
newSocket.on('disconnect', (reason) => console.log('Disconnected:', reason));
newSocket.on('connect_error', (error) => console.error('Error:', error));

// User status events
newSocket.on('user:online', (data) => setOnlineUsers(prev => [...prev, data.userId]));
newSocket.on('user:offline', (data) => setOnlineUsers(prev => prev.filter(u => u !== data.userId)));
```

## 📨 WebSocket Events

### Client → Server Events

| Event | Description | Payload |
|-------|-------------|---------|
| `join:conversation` | Join a conversation room | `conversationId: string` |
| `leave:conversation` | Leave a conversation room | `conversationId: string` |
| `message:send` | Send a message | `{ conversationId, message }` |
| `typing:start` | Start typing indicator | `{ conversationId, userName }` |
| `typing:stop` | Stop typing indicator | `{ conversationId }` |
| `message:read` | Mark message as read | `{ conversationId, messageId }` |
| `users:online` | Get online users | Callback function |

### Server → Client Events

| Event | Description | Payload |
|-------|-------------|---------|
| `connect` | Socket connected | `socket.id` |
| `disconnect` | Socket disconnected | `reason: string` |
| `user:online` | User came online | `{ userId, lastSeen }` |
| `user:offline` | User went offline | `{ userId, lastSeen, reason }` |
| `message:receive` | New message received | `Message object` |
| `typing:start` | User started typing | `{ userId, userName, conversationId }` |
| `typing:stop` | User stopped typing | `{ userId, conversationId }` |
| `message:read` | Message was read | `{ messageId, userId, readAt }` |

## 🚀 How to Start the WebSocket Server

### Development Mode

```bash
npm run dev
```

This starts both the Next.js app and Socket.io server on port 3000.

### Production Mode

```bash
npm run build
npm run start
```

### Check if WebSocket is Running

1. **Server Console**: Look for `"Ready on http://localhost:3000 with Socket.io support"`
2. **Browser DevTools**: Check Network tab for WebSocket connections
3. **Client Console**: Look for `"Socket connected: [socket-id]"`

## 🔍 Debugging WebSocket Connections

### 1. Check Authentication

```javascript
// In browser console
console.log('Token:', document.cookie.includes('token'));
```

### 2. Check Connection Status

```javascript
// In React component
const { socket, isConnected } = useSocket();
console.log('Socket:', socket?.id, 'Connected:', isConnected);
```

### 3. Monitor Events

```javascript
// Add to SocketContext for debugging
newSocket.onAny((event, ...args) => {
  console.log('Socket event:', event, args);
});
```

## 🔧 Environment Variables

Make sure these are set in `.env.local`:

```env
# Required for WebSocket authentication
JWT_SECRET=your-jwt-secret-key

# WebSocket server URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# MongoDB for data persistence
MONGODB_URI=mongodb://localhost:27017/college-connect
```

## 📱 Usage in Components

### 1. Using the Socket Hook

```typescript
import { useSocket } from '@/lib/contexts/SocketContext';

function MessagesComponent() {
  const {
    socket,
    isConnected,
    joinConversation,
    sendMessage
  } = useSocket();

  useEffect(() => {
    if (socket) {
      joinConversation(conversationId);

      socket.on('message:receive', handleNewMessage);
      return () => socket.off('message:receive', handleNewMessage);
    }
  }, [socket]);
}
```

### 2. Sending Messages

```typescript
const handleSendMessage = async (content: string) => {
  // First save to database via REST API
  const response = await fetch(`/api/messages/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, messageType: 'text' })
  });

  if (response.ok) {
    const { message } = await response.json();

    // Then broadcast via WebSocket
    sendMessage(conversationId, message);
  }
};
```

## 🛠️ Common Issues & Solutions

### Issue 1: "Socket not connected"

**Solution**: Check if user is authenticated and token is valid.

```typescript
// In SocketContext
useEffect(() => {
  if (user && token) {
    // Initialize socket
  }
}, [user]); // Only when user is available
```

### Issue 2: "CORS errors"

**Solution**: Update CORS configuration in server.js:

```javascript
cors: {
  origin: ["http://localhost:3000", "your-production-domain"],
  credentials: true
}
```

### Issue 3: "Authentication failed"

**Solution**: Verify JWT_SECRET matches between client and server:

```bash
# Check environment variables
echo $JWT_SECRET
```

### Issue 4: "Messages not received"

**Solution**: Ensure proper room joining:

```typescript
// Join conversation before sending messages
joinConversation(conversationId);

// Listen for messages
socket.on('message:receive', handleNewMessage);
```

## 🔄 Connection Lifecycle

1. **User Login** → JWT token stored in cookies
2. **Socket Connection** → Token sent in auth header
3. **Server Authentication** → JWT verified, userId attached
4. **Join Rooms** → User joins conversation rooms
5. **Real-time Events** → Messages, typing, status updates
6. **Disconnect** → Cleanup and offline status broadcast

## 📊 Monitoring & Analytics

### Active Users Tracking

The server maintains active users in memory:

```javascript
const activeUsers = new Map(); // userId -> { socketId, userInfo }
const userSockets = new Map(); // socketId -> userId
```

### Connection Health Check

```typescript
// In React component
useEffect(() => {
  const interval = setInterval(() => {
    if (socket && !socket.connected) {
      console.warn('Socket disconnected, attempting reconnection...');
    }
  }, 30000);

  return () => clearInterval(interval);
}, [socket]);
```

## 🔒 Security Considerations

1. **JWT Validation**: All socket connections require valid JWT tokens
2. **Room Authorization**: Users can only join conversations they're part of
3. **Rate Limiting**: Consider adding rate limiting for message sending
4. **Input Sanitization**: Validate all incoming socket data
5. **CORS Configuration**: Restrict origins in production

## 🚀 Performance Tips

1. **Connection Pooling**: Socket.io handles connection pooling automatically
2. **Event Cleanup**: Always remove event listeners in useEffect cleanup
3. **Debounce Typing**: Implement typing indicator debouncing
4. **Message Pagination**: Load messages in chunks, not all at once
5. **Memory Management**: Clean up inactive users periodically
