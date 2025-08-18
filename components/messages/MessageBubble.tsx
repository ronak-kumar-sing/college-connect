// components/messages/MessageBubble.tsx
'use client'
import React from 'react'
import { Check, CheckCheck, Clock, MoreVertical } from 'lucide-react'

interface Message {
  id: string
  content: string
  messageType: 'text' | 'image' | 'file' | 'system'
  sender: {
    id: string
    name: string
    username: string
  }
  attachments?: any[]
  readBy: { user: string; readAt: string }[]
  edited: boolean
  editedAt?: string
  createdAt: string
}

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
  showSender?: boolean
  isGroupChat?: boolean
  currentUserId: string
  onlineUsers: string[]
  conversationParticipants: string[]
}

export function MessageBubble({
  message,
  isOwn,
  showSender = false,
  isGroupChat = false,
  currentUserId,
  onlineUsers,
  conversationParticipants
}: MessageBubbleProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getReadStatus = () => {
    if (!isOwn) return null

    const otherParticipants = conversationParticipants.filter(id => id !== currentUserId)
    const readByOthers = message.readBy.filter(read => read.user !== currentUserId)

    // If it's a group chat
    if (isGroupChat) {
      if (readByOthers.length === 0) {
        return <Clock className="h-3 w-3 text-gray-400" />
      } else if (readByOthers.length < otherParticipants.length) {
        return <Check className="h-3 w-3 text-gray-400" />
      } else {
        return <CheckCheck className="h-3 w-3 text-blue-500" />
      }
    }

    // For direct messages
    if (readByOthers.length === 0) {
      return <Check className="h-3 w-3 text-gray-400" />
    } else {
      return <CheckCheck className="h-3 w-3 text-blue-500" />
    }
  }

  const getSenderAvatar = () => {
    if (!showSender) return null

    const initials = message.sender.name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2)

    return (
      <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-white font-medium text-xs">{initials}</span>
      </div>
    )
  }

  if (message.messageType === 'system') {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className={`flex mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2`}>
        {/* Sender Avatar (only for received messages in group chats) */}
        {!isOwn && isGroupChat && (
          <div className="mb-1">
            {getSenderAvatar()}
          </div>
        )}

        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
          {/* Sender name (only for received messages in group chats) */}
          {!isOwn && isGroupChat && showSender && (
            <span className="text-xs text-gray-600 mb-1 px-1">
              {message.sender.name}
            </span>
          )}

          {/* Message bubble */}
          <div
            className={`
              relative px-4 py-2 rounded-lg shadow-sm
              ${isOwn
                ? 'bg-blue-500 text-white'
                : 'bg-white border border-gray-200 text-gray-900'
              }
              ${isOwn ? 'rounded-br-sm' : 'rounded-bl-sm'}
            `}
          >
            {/* Message content */}
            <div className="break-words">
              {message.messageType === 'text' && (
                <p className="text-sm leading-relaxed">{message.content}</p>
              )}

              {message.messageType === 'image' && (
                <div>
                  <div className="bg-gray-100 rounded-lg p-3 mb-2">
                    <p className="text-sm">📷 Image</p>
                  </div>
                  {message.content && (
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  )}
                </div>
              )}

              {message.messageType === 'file' && (
                <div>
                  <div className="bg-gray-100 rounded-lg p-3 mb-2">
                    <p className="text-sm">📎 File attachment</p>
                  </div>
                  {message.content && (
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  )}
                </div>
              )}
            </div>

            {/* Message info */}
            <div className={`flex items-center space-x-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'
              }`}>
              <span className={`text-xs ${isOwn ? 'text-blue-100' : 'text-gray-500'
                }`}>
                {formatTime(message.createdAt)}
              </span>

              {message.edited && (
                <span className={`text-xs ${isOwn ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                  • edited
                </span>
              )}

              {/* Read status for sent messages */}
              {isOwn && (
                <div className="ml-1">
                  {getReadStatus()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Message options (on hover) */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
