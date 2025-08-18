# WebSocket Quick Start Guide

## 🚀 How to Connect WebSocket Properly

### Step 1: Start the Development Server

```bash
npm run dev
```

This starts both Next.js and the Socket.io server on port 3000.

### Step 2: Test WebSocket Connection

```bash
npm run test:websocket
```

Expected output:
```
🚀 Testing WebSocket Connection...
📝 Generated test token: eyJhbGciOiJIUzI1NiIsI...
✅ Connected to server!
🆔 Socket ID: abc123def456
🔗 Connected: true
📡 Transport: websocket
```

### Step 3: Add Debug Component (Optional)

Add to your layout or any page:

```tsx
import { WebSocketStatus } from '@/components/debug/WebSocketStatus'

export default function Layout() {
  return (
    <div>
      {/* Add this for debugging */}
      <WebSocketStatus showDetails={true} />

      {/* Your existing content */}
    </div>
  )
}
```

### Step 4: Use in Your Components

```tsx
import { useSocket } from '@/lib/contexts/SocketContext'

function MyComponent() {
  const { socket, isConnected, sendMessage } = useSocket()

  useEffect(() => {
    if (socket && isConnected) {
      // Join conversation
      socket.emit('join:conversation', conversationId)

      // Listen for messages
      socket.on('message:receive', handleNewMessage)

      return () => socket.off('message:receive', handleNewMessage)
    }
  }, [socket, isConnected])

  const handleSend = async (content) => {
    // First save to database
    const response = await fetch('/api/messages/...', {
      method: 'POST',
      body: JSON.stringify({ content })
    })

    if (response.ok) {
      const { message } = await response.json()

      // Then broadcast via WebSocket
      sendMessage(conversationId, message)
    }
  }
}
```

## 🔍 Troubleshooting

### Issue: "Socket not connected"

**Check 1: Server running?**
```bash
curl http://localhost:3000/socket.io/socket.io.js
# Should return the Socket.io client library
```

**Check 2: Environment variables**
```bash
# Make sure these are set in .env.local:
NEXT_PUBLIC_BASE_URL=http://localhost:3000
JWT_SECRET=your-jwt-secret
```

**Check 3: User authenticated?**
```javascript
// In browser console
console.log('User:', JSON.parse(localStorage.getItem('user') || 'null'))
console.log('Token:', document.cookie.includes('token'))
```

### Issue: "Authentication failed"

**Solution:** Make sure you're logged in and JWT_SECRET matches:

```javascript
// In server.js and .env.local, JWT_SECRET must match
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

### Issue: "CORS errors"

**Solution:** Update server.js CORS configuration:

```javascript
cors: {
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  methods: ["GET", "POST"],
  credentials: true
}
```

### Issue: "Messages not received"

**Solution:** Make sure you join conversation rooms:

```typescript
// Before sending/receiving messages
joinConversation(conversationId)

// Listen for messages
socket.on('message:receive', (message) => {
  setMessages(prev => [...prev, message])
})
```

## 📊 Connection Health Check

Add this to your component for monitoring:

```typescript
useEffect(() => {
  if (socket) {
    const interval = setInterval(() => {
      if (socket.connected) {
        console.log('✅ WebSocket healthy')
      } else {
        console.warn('❌ WebSocket disconnected, attempting reconnect...')
        socket.connect()
      }
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }
}, [socket])
```

## 🎯 Best Practices

1. **Always clean up event listeners:**
```typescript
useEffect(() => {
  if (socket) {
    socket.on('message:receive', handleMessage)
    return () => socket.off('message:receive', handleMessage)
  }
}, [socket])
```

2. **Handle connection states:**
```typescript
if (!socket || !isConnected) {
  return <div>Connecting...</div>
}
```

3. **Graceful fallbacks:**
```typescript
const sendMessage = async (content) => {
  // Always save to database first
  const saved = await saveToDatabase(content)

  // Then try WebSocket broadcast
  if (socket?.connected) {
    socket.emit('message:send', saved)
  }
  // Message will still be saved even if WebSocket fails
}
```

4. **Debug mode:**
```typescript
// Add this to see all socket events
if (process.env.NODE_ENV === 'development') {
  socket.onAny((event, ...args) => {
    console.log(`📡 ${event}:`, args)
  })
}
```

## 🔄 Complete Connection Flow

1. **User logs in** → JWT token stored in cookies
2. **SocketContext initializes** → Reads token from cookies
3. **Socket connects** → Token sent in auth header
4. **Server authenticates** → JWT verified, userId attached
5. **Client state updates** → `isConnected = true`
6. **Join conversations** → `socket.emit('join:conversation', id)`
7. **Real-time events** → Messages, typing, status updates

## 📱 Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use HTTPS/WSS in production
- [ ] Set proper CORS origins
- [ ] Use strong JWT secrets (32+ characters)
- [ ] Implement rate limiting
- [ ] Add connection pooling
- [ ] Monitor socket connections
- [ ] Handle reconnection logic
- [ ] Add error tracking (Sentry, etc.)

## 🆘 Still Having Issues?

1. **Run the test script:** `npm run test:websocket`
2. **Check browser DevTools** → Network tab → WS connections
3. **Check server console** → Look for connection logs
4. **Add debug component** → Use `<WebSocketStatus showDetails={true} />`
5. **Open GitHub issue** with error logs and environment details
