// scripts/demo-messaging.js
// Demo script to showcase the real-time messaging functionality

const { io } = require('socket.io-client');
const jwt = require('jsonwebtoken');

// Create demo users
const users = [
  {
    userId: '507f1f77bcf86cd799439011',
    username: 'john_student',
    name: 'John Student'
  },
  {
    userId: '507f1f77bcf86cd799439012',
    username: 'priyasharma',
    name: 'Priya Sharma'
  }
];

// Generate demo JWT tokens
const demoTokens = users.map(user => {
  return {
    ...user,
    token: jwt.sign({ userId: user.userId }, 'your-super-secret-jwt-key-here-change-in-production')
  };
});

console.log('🚀 Real-Time Messaging Demo');
console.log('============================');
console.log();

console.log('Demo Users:');
demoTokens.forEach((user, index) => {
  console.log(`${index + 1}. ${user.name} (${user.username})`);
  console.log(`   User ID: ${user.userId}`);
  console.log(`   Token: ${user.token.substring(0, 50)}...`);
  console.log();
});

console.log('🔗 Socket.io Connection URLs:');
console.log('WebSocket: ws://localhost:3000');
console.log('Polling: http://localhost:3000/socket.io/');
console.log();

console.log('📱 Testing Instructions:');
console.log('1. Open http://localhost:3000/messages in multiple browser tabs');
console.log('2. Login with different demo users');
console.log('3. Start conversations and see real-time messaging');
console.log('4. Test typing indicators and online status');
console.log();

console.log('🛠 Available API Endpoints:');
console.log('GET /api/messages/conversations - Get user conversations');
console.log('POST /api/messages/conversations - Create new conversation');
console.log('GET /api/messages/conversations/:id/messages - Get messages');
console.log('POST /api/messages/conversations/:id/messages - Send message');
console.log();

console.log('⚡ Socket.io Events:');
console.log('Client -> Server:');
console.log('  - join:conversation');
console.log('  - leave:conversation');
console.log('  - message:send');
console.log('  - typing:start');
console.log('  - typing:stop');
console.log('  - message:read');
console.log();
console.log('Server -> Client:');
console.log('  - message:receive');
console.log('  - typing:start');
console.log('  - typing:stop');
console.log('  - message:read');
console.log('  - user:online');
console.log('  - user:offline');
console.log();

console.log('🎯 Features to Test:');
console.log('✅ Two-column layout (chat list + message panel)');
console.log('✅ Real-time message delivery');
console.log('✅ Typing indicators');
console.log('✅ Online/offline status');
console.log('✅ Message read receipts');
console.log('✅ Search functionality');
console.log('✅ Mobile responsive design');
console.log('✅ Message bubbles with proper alignment');
console.log('✅ Timestamps and user avatars');
console.log('✅ Group chat support');
console.log('✅ Bug fix: Correct sender/receiver name display');

// Simple Socket.io connection test
function testConnection() {
  console.log('🔌 Testing Socket.io connection...');

  const testSocket = io('http://localhost:3000', {
    auth: {
      token: demoTokens[0].token
    }
  });

  testSocket.on('connect', () => {
    console.log('✅ Socket.io connection successful!');
    console.log(`   Connected as: ${demoTokens[0].name}`);
    testSocket.disconnect();
  });

  testSocket.on('connect_error', (error) => {
    console.log('❌ Socket.io connection failed:');
    console.log(`   Error: ${error.message}`);
  });

  setTimeout(() => {
    if (!testSocket.connected) {
      console.log('⏰ Connection timeout - check server status');
    }
  }, 5000);
}

// Run connection test if server is available
testConnection();
