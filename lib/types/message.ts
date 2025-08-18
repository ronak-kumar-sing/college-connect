// lib/types/message.ts
export interface Message {
  id: string
  conversation?: string
  content: string
  messageType: 'text' | 'image' | 'file' | 'system'
  sender: {
    id: string
    name: string
    username: string
  }
  attachments?: {
    url: string
    filename: string
    fileType: string
    size: number
  }[]
  readBy: {
    user: string
    readAt: string
  }[]
  edited: boolean
  editedAt?: string
  replyTo?: {
    id: string
    content: string
    sender: string
    messageType: string
  }
  createdAt: string
  updatedAt?: string
}

export interface Participant {
  id: string
  name: string
  username: string
  avatar?: string
}

export interface Conversation {
  id: string
  type: 'direct' | 'group'
  title?: string
  participants: Participant[]
  lastMessage?: {
    id: string
    content: string
    messageType: string
    sender: string
    createdAt: string
  }
  lastMessageAt: string
  unreadCount: number
  isArchived: boolean
  isBlocked: boolean
  metadata?: {
    propertyId?: string
    bookingId?: string
  }
  createdAt?: string
  updatedAt?: string
}

export interface TypingUser {
  userId: string
  userName: string
}

export interface MessageOptions {
  page?: number
  limit?: number
  before?: string
  after?: string
}

export interface ConversationOptions {
  page?: number
  limit?: number
  search?: string
  archived?: boolean
}
