// components/messages/ChatItem.tsx
'use client'
import React from 'react'
import { Users } from 'lucide-react'

interface ChatItemConversation {
  id: string
  type: 'direct' | 'group'
  displayName: string
  avatar?: string
  isOnline: boolean
  lastMessageText: string
  lastMessageAt: string
  unreadCount: number
  lastMessage?: {
    sender: string
  }
}

interface ChatItemProps {
  conversation: ChatItemConversation
  isSelected: boolean
  onClick: () => void
  currentUserId: string
}

export function ChatItem({ conversation, isSelected, onClick, currentUserId }: ChatItemProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)
    const diffDays = diffHours / 24

    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60))
      return diffMins < 1 ? 'now' : `${diffMins}m`
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)}h`
    } else if (diffDays < 7) {
      return `${Math.floor(diffDays)}d`
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  const getAvatarDisplay = () => {
    if (conversation.avatar) {
      return (
        <img
          src={conversation.avatar}
          alt={conversation.displayName}
          className="w-12 h-12 rounded-full object-cover"
        />
      )
    }

    if (conversation.type === 'group') {
      return (
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <Users className="h-6 w-6 text-white" />
        </div>
      )
    }

    // Default avatar with initials
    const initials = conversation.displayName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2)

    return (
      <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
        <span className="text-white font-medium text-sm">{initials}</span>
      </div>
    )
  }

  const isOwnLastMessage = conversation.lastMessage?.sender === currentUserId

  return (
    <div
      onClick={onClick}
      className={`
        px-4 py-3 cursor-pointer transition-colors duration-150 hover:bg-gray-50 border-l-4
        ${isSelected
          ? 'bg-blue-50 border-l-blue-500 border-r-0'
          : 'border-l-transparent hover:border-l-gray-200'
        }
      `}
    >
      <div className="flex items-center space-x-3">
        {/* Avatar with online indicator */}
        <div className="relative flex-shrink-0">
          {getAvatarDisplay()}
          {conversation.isOnline && conversation.type === 'direct' && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className={`text-sm font-medium truncate ${isSelected ? 'text-gray-900' : 'text-gray-900'
              }`}>
              {conversation.displayName}
            </h3>
            <span className={`text-xs flex-shrink-0 ml-2 ${conversation.unreadCount > 0 ? 'text-blue-600 font-medium' : 'text-gray-500'
              }`}>
              {formatTime(conversation.lastMessageAt)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <p className={`text-sm truncate flex-1 ${conversation.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-600'
              }`}>
              {isOwnLastMessage && conversation.type === 'direct' && 'You: '}
              {conversation.lastMessageText}
            </p>

            {conversation.unreadCount > 0 && (
              <span className="ml-2 bg-blue-500 text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0">
                {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
              </span>
            )}
          </div>

          {/* Online status for direct messages */}
          {conversation.type === 'direct' && conversation.isOnline && (
            <p className="text-xs text-green-600 mt-1">Active now</p>
          )}
        </div>
      </div>
    </div>
  )
}
