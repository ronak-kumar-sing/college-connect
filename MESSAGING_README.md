# Real-Time Messaging System for College Connect

This is a comprehensive real-time messaging system built with Next.js, Socket.io, MongoDB, and Tailwind CSS. It provides a WhatsApp-like messaging experience with real-time features.

## Features

### 🚀 Core Features
- **Real-time messaging** using Socket.io
- **Two-column layout** with conversation list and chat panel
- **Message bubbles** with different styles for sender and receiver
- **Typing indicators** that show when users are typing
- **Online/offline status** for users
- **Read receipts** for messages
- **Mobile responsive** design
- **Search functionality** in conversation list

### 📱 Design & UI
- **Modern chat interface** similar to WhatsApp/Telegram
- **Avatar support** with initials fallback
- **Timestamps** and message status indicators
- **Smooth animations** and transitions
- **Dark/light message bubbles** based on sender
- **Group chat support** with sender names
- **Unread message counters**

### 🔧 Technical Features
- **JWT Authentication** for secure access
- **Socket.io** for real-time communication
- **MongoDB** for data persistence
- **RESTful API** endpoints
- **TypeScript** for type safety
- **Modular component architecture**
- **Custom hooks** for state management

## Installation & Setup

### 1. Clone and Install Dependencies

```bash
cd /Users/ronakkumar/Desktop/college-connect
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/college-connect

# JWT Secret (change in production)
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production

# Next.js Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Node Environment
NODE_ENV=development
```

### 3. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# macOS with Homebrew
brew services start mongodb-community

# Or start manually
mongod --dbpath /usr/local/var/mongodb
```

### 4. Seed Database (Optional)

```bash
npm run seed
```

### 5. Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── messages/
│   │   │   ├── conversations/
│   │   │   │   ├── route.ts              # Get/Create conversations
│   │   │   │   └── [id]/
│   │   │   │       ├── messages/
│   │   │   │       │   └── route.ts      # Get/Send messages
│   │   │   │       └── read/
│   │   │   │           └── route.ts      # Mark messages as read
│   │   │   └── typing/
│   │   │       └── route.ts              # Typing indicators
│   │   └── auth/                         # Authentication endpoints
│   ├── messages/
│   │   └── page.tsx                      # Main messaging interface
│   └── layout.tsx                        # Root layout with providers
│
├── components/
│   ├── messages/
│   │   ├── ChatList.tsx                  # Conversation list sidebar
│   │   ├── ChatItem.tsx                  # Individual conversation item
│   │   ├── MessageBubble.tsx             # Message bubble component
│   │   ├── ChatInput.tsx                 # Message input with attachments
│   │   └── TypingIndicator.tsx           # Typing indicator component
│   └── dashboard/
│       └── MessageOwner.tsx              # Property owner messaging
│
├── lib/
│   ├── contexts/
│   │   └── SocketContext.tsx             # Socket.io context provider
│   ├── hooks/
│   │   ├── useAuth.ts                    # Authentication hook
│   │   └── useRealTimeMessages.ts        # Real-time messaging hook
│   ├── services/
│   │   └── messageService.ts             # API service layer
│   ├── types/
│   │   └── message.ts                    # TypeScript interfaces
│   └── utils/
│
├── models/
│   ├── User.ts                           # User model
│   ├── Conversation.ts                   # Conversation model
│   ├── Message.ts                        # Message model
│   └── Notification.ts                   # Notification model
│
└── server.js                             # Custom Socket.io server
```

## Usage Guide

### 1. Starting a Conversation

From any property page, users can click "Message Owner" to start a conversation:

```tsx
<MessageOwner
  propertyId="property-id"
  ownerId="owner-user-id"
  ownerName="John Doe"
  propertyTitle="Cozy 2BHK Apartment"
/>
```

### 2. Real-time Messaging

The messaging system provides real-time features:

- **Instant message delivery** via Socket.io
- **Typing indicators** when someone is typing
- **Online/offline status** for users
- **Read receipts** for delivered messages
- **Message timestamps** and status

### 3. Message Types

The system supports different message types:

```typescript
interface Message {
  messageType: 'text' | 'image' | 'file' | 'system'
  content: string
  attachments?: Attachment[]
  // ... other properties
}
```

### 4. API Endpoints

#### Get Conversations
```http
GET /api/messages/conversations
```

#### Get Messages
```http
GET /api/messages/conversations/[id]/messages
```

#### Send Message
```http
POST /api/messages/conversations/[id]/messages
Content-Type: application/json

{
  "content": "Hello, I'm interested in your property",
  "messageType": "text"
}
```

## Components Documentation

### ChatList Component

Displays the list of conversations with search functionality:

```tsx
<ChatList
  conversations={conversations}
  selectedConversationId={selectedConversation?.id}
  onConversationSelect={handleConversationSelect}
  searchQuery={searchQuery}
  onSearchChange={setSearchQuery}
  currentUserId={user.userId}
  onlineUsers={onlineUsers}
/>
```

### MessageBubble Component

Renders individual messages with proper styling:

```tsx
<MessageBubble
  message={message}
  isOwn={message.sender.id === currentUserId}
  showSender={shouldShowSender}
  isGroupChat={conversation.type === 'group'}
  currentUserId={currentUserId}
  onlineUsers={onlineUsers}
  conversationParticipants={participants}
/>
```

### ChatInput Component

Handles message input with typing indicators:

```tsx
<ChatInput
  onSendMessage={handleSendMessage}
  onStartTyping={handleStartTyping}
  onStopTyping={handleStopTyping}
  disabled={sending || !isConnected}
  placeholder="Type a message..."
/>
```

## Socket.io Events

### Client to Server
- `join:conversation` - Join a conversation room
- `leave:conversation` - Leave a conversation room
- `message:send` - Send a message
- `typing:start` - Start typing indicator
- `typing:stop` - Stop typing indicator
- `message:read` - Mark message as read

### Server to Client
- `message:receive` - Receive new message
- `typing:start` - Someone started typing
- `typing:stop` - Someone stopped typing
- `message:read` - Message read receipt
- `user:online` - User came online
- `user:offline` - User went offline

## Customization

### Styling
The components use Tailwind CSS classes. You can customize the appearance by modifying the classes in each component.

### Socket Events
Add new socket events in both `server.js` and the Socket context to extend functionality.

### Message Types
Extend the message types by updating the TypeScript interfaces and adding handling logic.

## Troubleshooting

### Common Issues

1. **Socket.io connection fails**
   - Check if the server is running with `npm run dev`
   - Verify `NEXT_PUBLIC_BASE_URL` in environment variables

2. **Messages not appearing**
   - Check browser console for errors
   - Verify JWT authentication is working

3. **Database connection issues**
   - Ensure MongoDB is running
   - Check `MONGODB_URI` in environment variables

4. **Typing indicators not working**
   - Check Socket.io connection status
   - Verify typing event handlers

### Development Tips

1. **Debug Socket connections** using browser dev tools Network tab
2. **Monitor MongoDB** using MongoDB Compass or similar tools
3. **Check API responses** in the Network tab for debugging
4. **Use React Developer Tools** to inspect component state

## Production Deployment

1. **Environment Variables**: Update all environment variables for production
2. **MongoDB**: Use a production MongoDB instance (MongoDB Atlas recommended)
3. **JWT Secret**: Use a strong, unique JWT secret
4. **Socket.io**: Configure CORS settings for your domain
5. **HTTPS**: Ensure HTTPS is enabled for WebSocket connections

## Bug Fixes Applied

### Sender/Receiver Name Bug
The original issue where sender names appeared instead of receiver names has been fixed by:

1. **Proper participant mapping** in conversation display
2. **Correct message sender identification** in message bubbles
3. **Fixed message context** in the MessageOwner component
4. **Proper conversation participant handling** in the backend

### Key fixes:
- `ChatItem` component now correctly shows the other participant's name
- `MessageBubble` properly identifies own vs. received messages
- Backend APIs correctly populate sender information
- Socket events include proper user identification

## Contributing

1. Follow the existing code structure
2. Add TypeScript types for new features
3. Update this README for new functionality
4. Test real-time features thoroughly
5. Ensure mobile responsiveness

## License

This project is part of the College Connect platform.
