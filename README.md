# 🏠 College Connect - Real-Time Room Booking & Messaging Platform

A comprehensive college accommodation platform built with Next.js 15, featuring real-time messaging, room booking, and property management capabilities.

## 🌟 Features

### 🏨 Room & Property Management
- Browse and search available rooms
- Advanced filtering (price, location, amenities)
- Detailed room information with image galleries
- Booking system with calendar integration
- Property owner dashboard

### 💬 Real-Time Messaging
- WhatsApp-style messaging interface
- Real-time message delivery via WebSocket
- Typing indicators and read receipts
- Online/offline user status
- Group conversations support
- Message search and history

### 🔐 Authentication & Security
- JWT-based authentication
- Secure user registration and login
- Role-based access control (Student/Owner)
- Protected routes and API endpoints

### 📱 Responsive Design
- Mobile-first responsive design
- Progressive Web App capabilities
- Touch-friendly interface
- Cross-platform compatibility

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB 5.0+
- npm or yarn

### 1. Clone & Install

```bash
git clone https://github.com/ronak-kumar-sing/college-connect.git
cd college-connect
npm install
```

### 2. Environment Setup

Create `.env.local` in the root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/college-connect

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-key-change-in-production

# Application
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NODE_ENV=development

# File Uploads (Optional)
UPLOAD_DIR=./public/uploads
MAX_FILE_SIZE=10485760
```

### 3. Start MongoDB

```bash
# macOS (Homebrew)
brew services start mongodb-community

# Ubuntu/Debian
sudo systemctl start mongod

# Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 4. Seed Database (Optional)

```bash
npm run seed
```

### 5. Start Development Server

```bash
npm run dev
```

🎉 Open [http://localhost:3000](http://localhost:3000) to view the application!

## 📁 Project Structure

```
college-connect/
├── 📁 app/                    # Next.js 15 App Router
│   ├── 📁 api/               # API Routes
│   │   ├── auth/             # Authentication endpoints
│   │   ├── messages/         # Real-time messaging API
│   │   ├── bookings/         # Room booking API
│   │   ├── notifications/    # Notification system
│   │   └── rooms/           # Room management API
│   ├── 📁 dashboard/        # Student dashboard
│   ├── 📁 messages/         # Messaging interface
│   ├── 📁 owner/           # Property owner portal
│   └── 📁 rooms/           # Room browsing
├── 📁 components/           # Reusable UI components
│   ├── dashboard/          # Dashboard components
│   ├── messages/           # Chat components
│   ├── owner/             # Owner dashboard components
│   └── ui/                # Base UI components
├── 📁 lib/                # Utilities & configurations
│   ├── contexts/          # React contexts
│   ├── hooks/            # Custom React hooks
│   ├── middleware/       # Authentication middleware
│   └── types/           # TypeScript type definitions
├── 📁 models/            # MongoDB models
└── 📁 public/           # Static assets
```

## 🛠️ Available Scripts

```bash
npm run dev          # Start development server with WebSocket
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run seed         # Seed database with sample data
```

## 🔌 WebSocket Integration

College Connect uses Socket.io for real-time features:

### Key Features:
- **Real-time messaging** with instant delivery
- **Typing indicators** show when users are typing
- **Online status** tracking for all users
- **Read receipts** for message acknowledgment
- **Conversation management** with rooms

### Quick Usage:

```typescript
import { useSocket } from '@/lib/contexts/SocketContext';

function ChatComponent() {
  const { socket, isConnected, sendMessage } = useSocket();

  useEffect(() => {
    if (socket) {
      socket.on('message:receive', handleNewMessage);
      return () => socket.off('message:receive', handleNewMessage);
    }
  }, [socket]);

  const handleSend = (message) => {
    sendMessage(conversationId, message);
  };
}
```

📖 **Detailed WebSocket Guide**: See [WEBSOCKET_GUIDE.md](./WEBSOCKET_GUIDE.md)

## 🏗️ Architecture Overview

### Tech Stack
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Socket.io
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with httpOnly cookies
- **Real-time**: Socket.io WebSocket connections
- **File Uploads**: Multer with local storage
- **Styling**: Tailwind CSS with custom components

### Key Patterns
- **Component-based Architecture**: Modular, reusable components
- **Custom Hooks**: Centralized state management logic
- **Context Providers**: Global state management
- **Middleware**: Authentication and authorization
- **Type Safety**: Full TypeScript implementation

## 📊 Database Schema

### Core Models

```typescript
User {
  username: string
  email: string
  password: string (hashed)
  role: 'student' | 'owner'
  profile: UserProfile
}

Room {
  title: string
  description: string
  price: number
  location: string
  amenities: string[]
  images: string[]
  owner: ObjectId
  availability: boolean
}

Message {
  content: string
  messageType: 'text' | 'image' | 'file'
  sender: ObjectId
  conversation: ObjectId
  readBy: ReadReceipt[]
  createdAt: Date
}

Booking {
  room: ObjectId
  tenant: ObjectId
  startDate: Date
  endDate: Date
  status: 'pending' | 'confirmed' | 'cancelled'
  totalAmount: number
}
```

## 🔐 Authentication Flow

1. **User Registration/Login** → JWT token generated
2. **Token Storage** → Secure httpOnly cookie
3. **Protected Routes** → Middleware validation
4. **API Authentication** → Token verification
5. **WebSocket Auth** → Token in socket handshake

### Protected Routes:
- `/dashboard/*` - Student dashboard
- `/owner/*` - Property owner portal
- `/messages` - Real-time messaging
- `/api/*` - API endpoints (most)

## 🎨 UI Components

Built with custom components using Tailwind CSS:

```typescript
// Example usage
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';

<Button variant="primary" size="lg">
  Book Now
</Button>

<Modal isOpen={showModal} onClose={() => setShowModal(false)}>
  <BookingForm />
</Modal>
```

Available components:
- `Button` - Various styles and sizes
- `Input` - Form inputs with validation
- `Modal` - Overlay modals
- `Badge` - Status indicators
- `Tabs` - Tab navigation
- `Slider` - Range inputs

## 📱 API Documentation

### Authentication

```bash
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/profile
```

### Messaging

```bash
GET  /api/messages/conversations          # Get user conversations
POST /api/messages/conversations          # Create new conversation
GET  /api/messages/conversations/:id/messages  # Get messages
POST /api/messages/conversations/:id/messages  # Send message
```

### Rooms & Bookings

```bash
GET  /api/rooms                    # Browse rooms
GET  /api/rooms/:id               # Get room details
POST /api/bookings                # Create booking
GET  /api/bookings/:id           # Get booking details
```

## 🔧 Development Guide

### Adding New Features

1. **Create API Route**: Add to `app/api/`
2. **Create Components**: Add to `components/`
3. **Add Types**: Define in `lib/types/`
4. **Update Models**: Modify MongoDB models
5. **Test Integration**: Verify with real data

### Database Operations

```typescript
// Example model usage
import User from '@/models/User';
import { connectDB } from '@/lib/mongodb';

export async function createUser(userData) {
  await connectDB();
  const user = new User(userData);
  return await user.save();
}
```

### Custom Hooks

```typescript
// Example custom hook
import { useAuth } from '@/lib/hooks/useAuth';
import { useSocket } from '@/lib/contexts/SocketContext';

function useMessaging() {
  const { user } = useAuth();
  const { sendMessage, joinConversation } = useSocket();

  return {
    sendMessage: (content) => sendMessage(conversationId, content),
    joinChat: (id) => joinConversation(id)
  };
}
```

## 🚀 Deployment

### Production Build

```bash
npm run build
npm run start
```

### Environment Variables (Production)

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/college-connect
JWT_SECRET=your-production-jwt-secret-minimum-32-characters
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

### Deployment Platforms

- **Vercel**: Automatic deployment with GitHub integration
- **Digital Ocean**: Full control with App Platform
- **AWS**: EC2 + MongoDB Atlas
- **Railway**: Simple deployment with database

## 🐛 Troubleshooting

### Common Issues

**WebSocket not connecting:**
```bash
# Check if server is running with WebSocket support
curl http://localhost:3000/socket.io/socket.io.js
```

**Authentication errors:**
```bash
# Verify JWT secret is set
echo $JWT_SECRET
```

**Database connection failed:**
```bash
# Check MongoDB is running
brew services list | grep mongodb
```

**Build errors:**
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### Development Guidelines
- Follow TypeScript strict mode
- Use ESLint configuration
- Write meaningful commit messages
- Add JSDoc comments for functions
- Test WebSocket functionality

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [WEBSOCKET_GUIDE.md](./WEBSOCKET_GUIDE.md)
- **Issues**: [GitHub Issues](https://github.com/ronak-kumar-sing/college-connect/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ronak-kumar-sing/college-connect/discussions)

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Real-time powered by [Socket.io](https://socket.io/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons by [Lucide](https://lucide.dev/)

---

**Happy Coding! 🎉**

Made with ❤️ for college students finding their perfect accommodation.