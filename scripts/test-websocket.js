// scripts/test-websocket.js
// Simple WebSocket connection test script

const { io } = require('socket.io-client');
const jwt = require('jsonwebtoken');

// Configuration
const SERVER_URL = 'http://localhost:3000';
const JWT_SECRET = '3bf3f52e6207a6cc15335a70bcb0c1be';

// Create a test JWT token
function createTestToken(userId = 'test-user-123') {
  return jwt.sign(
    { userId, username: 'testuser' },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

// Test WebSocket connection
async function testWebSocketConnection() {
  console.log('🚀 Testing WebSocket Connection...\n');

  const token = createTestToken();
  console.log('📝 Generated test token:', token.substring(0, 20) + '...\n');

  const socket = io(SERVER_URL, {
    auth: { token },
    transports: ['websocket', 'polling']
  });

  // Connection events
  socket.on('connect', () => {
    console.log('✅ Connected to server!');
    console.log('🆔 Socket ID:', socket.id);
    console.log('🔗 Connected:', socket.connected);
    console.log('📡 Transport:', socket.io.engine.transport.name, '\n');

    // Test basic functionality
    testBasicFunctionality(socket);
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Connection Error:', error.message);
    console.error('🔍 Details:', error);
    process.exit(1);
  });

  socket.on('disconnect', (reason) => {
    console.log('🔌 Disconnected:', reason);
    process.exit(0);
  });

  // User status events
  socket.on('user:online', (data) => {
    console.log('👤 User online:', data);
  });

  socket.on('user:offline', (data) => {
    console.log('👤 User offline:', data);
  });

  // Message events
  socket.on('message:receive', (data) => {
    console.log('📨 Message received:', data);
  });

  socket.on('typing:start', (data) => {
    console.log('⌨️ User started typing:', data);
  });

  socket.on('typing:stop', (data) => {
    console.log('⌨️ User stopped typing:', data);
  });

  // Keep alive for testing
  setTimeout(() => {
    console.log('⏰ Test completed, disconnecting...');
    socket.disconnect();
  }, 10000); // 10 seconds
}

function testBasicFunctionality(socket) {
  console.log('🧪 Testing basic functionality...\n');

  // Test 1: Get online users
  socket.emit('users:online', (users) => {
    console.log('👥 Online users:', users.length);
  });

  // Test 2: Join a test conversation
  const testConversationId = 'test-conversation-123';
  socket.emit('join:conversation', testConversationId);
  console.log('🏠 Joined conversation:', testConversationId);

  // Test 3: Test typing indicator
  setTimeout(() => {
    socket.emit('typing:start', {
      conversationId: testConversationId,
      userName: 'Test User'
    });
    console.log('⌨️ Started typing indicator');

    setTimeout(() => {
      socket.emit('typing:stop', { conversationId: testConversationId });
      console.log('⌨️ Stopped typing indicator');
    }, 2000);
  }, 1000);

  // Test 4: Send a test message (this won't persist in DB)
  setTimeout(() => {
    const testMessage = {
      id: 'test-msg-' + Date.now(),
      content: 'Hello from WebSocket test!',
      messageType: 'text',
      sender: {
        id: 'test-user-123',
        name: 'Test User',
        username: 'testuser'
      },
      createdAt: new Date().toISOString()
    };

    socket.emit('message:send', {
      conversationId: testConversationId,
      message: testMessage
    });
    console.log('📤 Sent test message');
  }, 3000);
}

// Error handling
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the test
if (require.main === module) {
  testWebSocketConnection();
}
