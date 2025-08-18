# Notification and Messaging System

This document describes the comprehensive notification and messaging system implemented for the CollegeConnect platform.

## Features

### Notifications System
- **Real-time notifications** for important events
- **Multiple notification types**: message, booking, property, system, favorite, review
- **Priority levels**: low, medium, high
- **Bulk actions**: mark all as read, delete multiple
- **Auto-expiry** for time-sensitive notifications
- **Rich notification data** with action URLs

### Messaging System
- **Direct messaging** between users
- **Group conversations** (future enhancement)
- **Real-time message delivery**
- **Message read receipts**
- **Message editing and deletion**
- **File attachments** (structure ready)
- **Reply to messages** (structure ready)

## API Endpoints

### Notifications

#### `GET /api/notifications`
Fetch notifications for authenticated user
- Query params: `page`, `limit`, `unread`, `type`
- Returns: paginated notifications with unread count

#### `PUT /api/notifications/[id]`
Mark notification as read/unread
- Body: `{ read: boolean }`

#### `DELETE /api/notifications/[id]`
Delete a notification

#### `POST /api/notifications/bulk`
Bulk operations on notifications
- Body: `{ action: 'mark_as_read' | 'delete', notificationIds?: string[], markAllAsRead?: boolean, type?: string }`

#### `POST /api/admin/notifications`
Send system notifications (Admin only)
- Requires admin API key
- Body: `{ type: 'broadcast' | 'targeted' | 'user_type', recipients?, userType?, notification: { title, message, actionUrl?, priority?, expiresAt? } }`

### Messaging

#### `GET /api/messages/conversations`
Get user's conversations
- Query params: `page`, `limit`, `search`
- Returns: conversations with last message and unread count

#### `POST /api/messages/conversations`
Create new conversation
- Body: `{ participants: string[], type: 'direct' | 'group', title?, description?, metadata? }`

#### `GET /api/messages/conversations/[id]`
Get conversation details

#### `PUT /api/messages/conversations/[id]`
Update conversation (admin/participants only)

#### `DELETE /api/messages/conversations/[id]`
Leave/delete conversation

#### `GET /api/messages/conversations/[id]/messages`
Get messages in conversation
- Query params: `page`, `limit`, `before`

#### `POST /api/messages/conversations/[id]/messages`
Send message in conversation
- Body: `{ content: string, messageType?: 'text' | 'image' | 'file', attachments?, replyTo? }`

#### `PUT /api/messages/conversations/[id]/messages/[messageId]`
Update message (edit or mark as read)
- Body: `{ content?: string, markAsRead?: boolean }`

#### `DELETE /api/messages/conversations/[id]/messages/[messageId]`
Delete message (soft delete)

### Bookings (with notifications)

#### `POST /api/bookings`
Create booking (sends notification to owner)

#### `PUT /api/bookings/[id]`
Update booking status (sends notification to tenant)

#### `DELETE /api/bookings/[id]`
Cancel booking (sends notification to other party)

## Data Models

### Notification Model
```typescript
interface INotification {
  recipient: ObjectId;          // User receiving notification
  sender?: ObjectId;            // User who triggered (null for system)
  type: 'message' | 'booking' | 'property' | 'system' | 'favorite' | 'review';
  title: string;
  message: string;
  data?: any;                   // Additional context data
  read: boolean;
  actionUrl?: string;           // URL to navigate when clicked
  priority: 'low' | 'medium' | 'high';
  expiresAt?: Date;            // Auto-expiry for temporary notifications
}
```

### Message Model
```typescript
interface IMessage {
  conversation: ObjectId;
  sender: ObjectId;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'system';
  attachments?: Array<{
    url: string;
    filename: string;
    fileType: string;
    size: number;
  }>;
  readBy: Array<{
    user: ObjectId;
    readAt: Date;
  }>;
  edited: boolean;
  editedAt?: Date;
  deleted: boolean;
  replyTo?: ObjectId;          // Reference to another message
}
```

### Conversation Model
```typescript
interface IConversation {
  participants: ObjectId[];
  type: 'direct' | 'group';
  title?: string;              // For group chats
  admin?: ObjectId;            // For group chats
  lastMessage?: ObjectId;
  lastMessageAt: Date;
  metadata?: {
    propertyId?: ObjectId;     // If conversation is about a property
    bookingId?: ObjectId;      // If conversation is about a booking
  };
  archived: Array<{
    user: ObjectId;
    archivedAt: Date;
  }>;
  blocked: Array<{
    blocker: ObjectId;
    blocked: ObjectId;
    blockedAt: Date;
  }>;
}
```

## React Components

### NotificationDropdown
- Real-time notification display
- Mark as read functionality
- Bulk actions
- Navigation to action URLs

### MessagesPage
- Full messaging interface
- Conversation list with search
- Real-time message display
- Mobile responsive

### MessageOwner
- Quick message component for property pages
- Creates conversation if needed
- Sends initial message with property context

## Utility Functions

### Notification Templates
Pre-defined notification templates for common events:
- `WELCOME_NEW_USER`
- `NEW_MESSAGE`
- `NEW_BOOKING`
- `BOOKING_CONFIRMED`
- `BOOKING_CANCELLED`
- `ROOM_FAVORITED`
- `NEW_REVIEW`
- `PROPERTY_APPROVED`
- `SYSTEM_MAINTENANCE`

### Hooks

#### useNotifications
Custom React hook for managing notifications:
- `fetchNotifications()`
- `markAsRead(id)`
- `deleteNotification(id)`
- `markAllAsRead()`
- `fetchUnreadCount()`

## Integration Points

### Existing Features Enhanced
1. **Room Favorites**: Now sends notifications to property owners
2. **User Registration**: Sends welcome notification
3. **Property Booking**: Complete booking workflow with notifications
4. **Header Component**: Real-time notification dropdown

### Authentication
- All APIs use the existing `withAuth` middleware
- Admin APIs require `ADMIN_API_KEY` environment variable

## Environment Variables

Add to your `.env.local`:
```
ADMIN_API_KEY=your-secure-admin-key-here
```

## Database Indexes

The system includes optimized database indexes for:
- Notification queries by recipient and read status
- Message queries by conversation and timestamp
- Conversation queries by participants

## Future Enhancements

1. **WebSocket Integration**: Real-time message delivery
2. **Push Notifications**: Browser/mobile push notifications
3. **File Attachments**: Complete file upload system
4. **Message Search**: Full-text search across messages
5. **Video/Voice Calls**: Integration with WebRTC
6. **Message Templates**: Quick reply templates
7. **Notification Preferences**: User-configurable notification settings

## Usage Examples

### Sending a System Notification
```bash
curl -X POST /api/admin/notifications \
  -H "Authorization: Bearer your-admin-key" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "broadcast",
    "notification": {
      "title": "System Maintenance",
      "message": "Scheduled maintenance tonight from 2-4 AM",
      "priority": "high"
    }
  }'
```

### Creating a Direct Message
```javascript
const response = await fetch('/api/messages/conversations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    participants: ['recipientUserId'],
    type: 'direct',
    metadata: { propertyId: 'property123' }
  })
});
```

This system provides a solid foundation for real-time communication and notifications in the CollegeConnect platform.
