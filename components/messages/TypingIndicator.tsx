// components/messages/TypingIndicator.tsx
'use client'
import React from 'react'

interface TypingUser {
  userId: string
  userName: string
}

interface TypingIndicatorProps {
  typingUsers: TypingUser[]
  isGroupChat?: boolean
}

export function TypingIndicator({ typingUsers, isGroupChat = false }: TypingIndicatorProps) {
  if (typingUsers.length === 0) {
    return null
  }

  const formatTypingText = () => {
    const names = typingUsers.map(user => user.userName)

    if (names.length === 1) {
      return `${names[0]} is typing...`
    } else if (names.length === 2) {
      return `${names[0]} and ${names[1]} are typing...`
    } else if (names.length === 3) {
      return `${names[0]}, ${names[1]} and ${names[2]} are typing...`
    } else {
      return `${names[0]}, ${names[1]} and ${names.length - 2} others are typing...`
    }
  }

  return (
    <div className="px-4 py-2 border-t border-gray-100">
      <div className="flex items-center space-x-2">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        <span className="text-sm text-gray-600 italic">
          {formatTypingText()}
        </span>
      </div>
    </div>
  )
}
