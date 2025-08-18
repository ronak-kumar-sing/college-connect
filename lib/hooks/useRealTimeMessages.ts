// lib/hooks/useRealTimeMessages.ts
'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSocket } from '@/lib/contexts/SocketContext'
import { useAuth } from '@/lib/hooks/useAuth'

interface Message {
  id: string
  conversation?: string
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
  replyTo?: any
  createdAt: string
}

interface Conversation {
  id: string
  type: 'direct' | 'group'
  title?: string
  participants: Array<{
    id: string
    name: string
    username: string
    avatar?: string
  }>
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

export function useRealTimeMessages() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [typingUsers, setTypingUsers] = useState<Array<{ userId: string; userName: string }>>([])
  const [loading, setLoading] = useState(true)

  const { user } = useAuth()
  const { socket, isConnected, joinConversation, leaveConversation, sendMessage, startTyping, stopTyping, markMessageRead } = useSocket()

  // Initialize conversations
  useEffect(() => {
    if (user) {
      fetchConversations()
    }
  }, [user])

  // Socket event listeners
  useEffect(() => {
    if (!socket) return

    const handleNewMessage = (message: Message) => {
      // Add message to the active conversation if it matches
      if (activeConversation && message.conversation === activeConversation) {
        setMessages(prev => [...prev, message])
      }

      // Update conversation's last message
      setConversations(prev => prev.map(conv => {
        if (conv.id === message.conversation) {
          return {
            ...conv,
            lastMessage: {
              id: message.id,
              content: message.content,
              messageType: message.messageType,
              sender: message.sender.id,
              createdAt: message.createdAt
            },
            lastMessageAt: message.createdAt,
            unreadCount: message.sender.id === user?.userId ? conv.unreadCount : conv.unreadCount + 1
          }
        }
        return conv
      }))
    }

    const handleTypingStart = ({ userId, userName, conversationId }: {
      userId: string
      userName: string
      conversationId: string
    }) => {
      if (userId !== user?.userId && conversationId === activeConversation) {
        setTypingUsers(prev => {
          const exists = prev.some(u => u.userId === userId)
          if (!exists) {
            return [...prev, { userId, userName }]
          }
          return prev
        })
      }
    }

    const handleTypingStop = ({ userId, conversationId }: {
      userId: string
      conversationId: string
    }) => {
      if (conversationId === activeConversation) {
        setTypingUsers(prev => prev.filter(u => u.userId !== userId))
      }
    }

    const handleMessageRead = ({
      messageId,
      userId,
      readAt
    }: {
      messageId: string
      userId: string
      readAt: string
    }) => {
      setMessages(prev => prev.map(msg => {
        if (msg.id === messageId) {
          const existingRead = msg.readBy.find(r => r.user === userId)
          if (!existingRead) {
            return {
              ...msg,
              readBy: [...msg.readBy, { user: userId, readAt }]
            }
          }
        }
        return msg
      }))
    }

    socket.on('message:receive', handleNewMessage)
    socket.on('typing:start', handleTypingStart)
    socket.on('typing:stop', handleTypingStop)
    socket.on('message:read', handleMessageRead)

    return () => {
      socket.off('message:receive', handleNewMessage)
      socket.off('typing:start', handleTypingStart)
      socket.off('typing:stop', handleTypingStop)
      socket.off('message:read', handleMessageRead)
    }
  }, [socket, activeConversation, user])

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/messages/conversations', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations || [])
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      const response = await fetch(`/api/messages/conversations/${conversationId}/messages`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])

        // Mark messages as read
        if (data.messages?.length > 0) {
          const unreadMessages = data.messages.filter((msg: Message) =>
            msg.sender.id !== user?.userId &&
            !msg.readBy.some(read => read.user === user?.userId)
          )

          for (const message of unreadMessages) {
            markMessageRead(conversationId, message.id)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }, [user, markMessageRead])

  const selectConversation = useCallback((conversationId: string) => {
    // Leave current conversation
    if (activeConversation && activeConversation !== conversationId) {
      leaveConversation(activeConversation)
    }

    setActiveConversation(conversationId)
    setMessages([])
    setTypingUsers([])

    // Join new conversation
    joinConversation(conversationId)
    fetchMessages(conversationId)
  }, [activeConversation, leaveConversation, joinConversation, fetchMessages])

  const sendMessageToConversation = useCallback(async (
    conversationId: string,
    content: string,
    messageType: 'text' | 'image' | 'file' = 'text'
  ) => {
    if (!user) return false

    try {
      const response = await fetch(`/api/messages/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          content,
          messageType
        })
      })

      if (response.ok) {
        const data = await response.json()
        const message = data.message

        // Add message to local state
        if (conversationId === activeConversation) {
          setMessages(prev => [...prev, message])
        }

        // Send via socket
        sendMessage(conversationId, message)

        // Update conversation list
        setConversations(prev => prev.map(conv => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              lastMessage: {
                id: message.id,
                content: message.content,
                messageType: message.messageType,
                sender: message.sender.id,
                createdAt: message.createdAt
              },
              lastMessageAt: message.createdAt,
              unreadCount: 0
            }
          }
          return conv
        }))

        return true
      }
      return false
    } catch (error) {
      console.error('Error sending message:', error)
      return false
    }
  }, [user, activeConversation, sendMessage])

  const handleStartTyping = useCallback((conversationId: string) => {
    if (user) {
      startTyping(conversationId, user.username)
    }
  }, [user, startTyping])

  const handleStopTyping = useCallback((conversationId: string) => {
    stopTyping(conversationId)
  }, [stopTyping])

  return {
    conversations,
    activeConversation,
    messages,
    typingUsers,
    loading,
    isConnected,
    selectConversation,
    sendMessageToConversation,
    handleStartTyping,
    handleStopTyping,
    fetchConversations,
    fetchMessages
  }
}
