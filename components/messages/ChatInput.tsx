// components/messages/ChatInput.tsx
'use client'
import React, { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, Image, Smile } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ChatInputProps {
  onSendMessage: (content: string, messageType?: 'text' | 'image' | 'file') => void
  onStartTyping: () => void
  onStopTyping: () => void
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({
  onSendMessage,
  onStartTyping,
  onStopTyping,
  disabled = false,
  placeholder = "Type a message..."
}: ChatInputProps) {
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
    }
  }, [message])

  // Handle typing indicators
  useEffect(() => {
    if (message.trim() && !isTyping) {
      setIsTyping(true)
      onStartTyping()
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false)
        onStopTyping()
      }
    }, 1000)

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [message, isTyping, onStartTyping, onStopTyping])

  const handleSend = () => {
    const trimmedMessage = message.trim()
    if (trimmedMessage && !disabled) {
      onSendMessage(trimmedMessage, 'text')
      setMessage('')
      if (isTyping) {
        setIsTyping(false)
        onStopTyping()
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileUpload = (type: 'image' | 'file') => {
    // Create file input
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = type === 'image' ? 'image/*' : '*/*'

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        // In a real implementation, you'd upload the file first
        // and then send a message with the file URL
        console.log('File selected:', file)
        onSendMessage(`📎 ${file.name}`, type)
      }
    }

    input.click()
  }

  return (
    <div className="bg-white border-t border-gray-200 p-4">
      <div className="flex items-end space-x-2">
        {/* Attachment buttons */}
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFileUpload('image')}
            disabled={disabled}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          >
            <Image className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFileUpload('file')}
            disabled={disabled}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
        </div>

        {/* Message input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={disabled ? "Cannot send messages" : placeholder}
            disabled={disabled}
            className="
              w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg resize-none
              focus:ring-2 focus:ring-blue-500 focus:border-transparent
              disabled:bg-gray-100 disabled:cursor-not-allowed
              max-h-30 min-h-[40px]
            "
            rows={1}
            style={{ minHeight: '40px' }}
          />

          {/* Emoji button */}
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
          >
            <Smile className="h-4 w-4" />
          </Button>
        </div>

        {/* Send button */}
        <Button
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>

      {/* Character count (optional) */}
      {message.length > 1900 && (
        <div className="mt-2 text-right">
          <span className={`text-xs ${message.length > 2000 ? 'text-red-500' : 'text-gray-500'
            }`}>
            {message.length}/2000
          </span>
        </div>
      )}
    </div>
  )
}
