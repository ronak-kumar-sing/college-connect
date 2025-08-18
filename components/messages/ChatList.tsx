// components/messages/ChatList.tsx
'use client'
import React, { useState, useEffect } from 'react'
import { MoreVertical, Users } from 'lucide-react'
import { ChatItem } from './ChatItem'

interface Participant {
  id: string
  name: string
  username: string
  avatar?: string
}

interface Conversation {
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
}

interface ChatListProps {
  conversations: Conversation[]
  selectedConversationId: string | null
  onConversationSelect: (conversation: Conversation) => void
  currentUserId: string
  onlineUsers: string[]
}

export function ChatList({
  conversations,
  selectedConversationId,
  onConversationSelect,
  currentUserId,
  onlineUsers
}: ChatListProps) {
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([])

  useEffect(() => {
    let filtered = conversations.filter(conv => !conv.isArchived)

    // Sort by last message time
    filtered.sort((a, b) =>
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    )

    setFilteredConversations(filtered)
  }, [conversations])

  const getConversationName = (conversation: Conversation) => {
    if (conversation.type === 'group') {
      return conversation.title || 'Group Chat'
    }

    // For direct messages, show the other participant's name
    const otherParticipant = conversation.participants.find(p => p.id !== currentUserId)
    return otherParticipant?.name || 'Unknown User'
  }

  const getConversationAvatar = (conversation: Conversation) => {
    if (conversation.type === 'group') {
      return null // Will show group icon
    }

    const otherParticipant = conversation.participants.find(p => p.id !== currentUserId)
    return otherParticipant?.avatar
  }

  const isUserOnline = (conversation: Conversation) => {
    if (conversation.type === 'group') {
      return conversation.participants.some(p =>
        p.id !== currentUserId && onlineUsers.includes(p.id)
      )
    }

    const otherParticipant = conversation.participants.find(p => p.id !== currentUserId)
    return otherParticipant ? onlineUsers.includes(otherParticipant.id) : false
  }

  const formatLastMessage = (conversation: Conversation) => {
    if (!conversation.lastMessage) {
      return 'No messages yet'
    }

    const { content, messageType, sender } = conversation.lastMessage
    const senderName = conversation.participants.find(p => p.id === sender)?.name || 'Unknown'
    const isOwnMessage = sender === currentUserId
    const prefix = conversation.type === 'group' && !isOwnMessage ? `${senderName}: ` : ''

    switch (messageType) {
      case 'image':
        return `${prefix}📷 Photo`
      case 'file':
        return `${prefix}📎 File`
      case 'system':
        return content
      default:
        return `${prefix}${content}`
    }
  }

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Users className="h-12 w-12 mb-4 text-gray-300" />
            <p className="text-sm">No conversations yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Start messaging property owners
            </p>
          </div>
        ) : (
          <div className="py-2">
            {filteredConversations.map((conversation) => (
              <ChatItem
                key={conversation.id}
                conversation={{
                  ...conversation,
                  displayName: getConversationName(conversation),
                  avatar: getConversationAvatar(conversation),
                  isOnline: isUserOnline(conversation),
                  lastMessageText: formatLastMessage(conversation)
                }}
                isSelected={selectedConversationId === conversation.id}
                onClick={() => onConversationSelect(conversation)}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
