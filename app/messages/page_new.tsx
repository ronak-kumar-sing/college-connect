'use client'
import React, { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Phone, Video, Users, MoreVertical, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { useSocket } from '@/lib/contexts/SocketContext'
import { ChatList } from '@/components/messages/ChatList'
import { MessageBubble } from '@/components/messages/MessageBubble'
import { ChatInput } from '@/components/messages/ChatInput'
import { TypingIndicator } from '@/components/messages/TypingIndicator'

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
  replyTo?: any
  createdAt: string
}

interface TypingUser {
  userId: string
  userName: string
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const [isMobile, setIsMobile] = useState(false)
  const [showMobileChat, setShowMobileChat] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { socket, isConnected, onlineUsers, joinConversation, leaveConversation, sendMessage, startTyping, stopTyping, markMessageRead } = useSocket()

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Initialize data
  useEffect(() => {
    if (user) {
      fetchConversations()
    }
  }, [user])

  // Handle URL conversation parameter
  useEffect(() => {
    const conversationId = searchParams.get('conversation')
    if (conversationId && conversations.length > 0) {
      const targetConversation = conversations.find(conv => conv.id === conversationId)
      if (targetConversation) {
        handleConversationSelect(targetConversation)
      }
    }
  }, [searchParams, conversations])

  // Socket event listeners
  useEffect(() => {
    if (!socket || !selectedConversation) return

    const handleNewMessage = (message: Message) => {
      setMessages(prev => [...prev, message])

      // Update conversation's last message
      setConversations(prev => prev.map(conv => {
        if (conv.id === selectedConversation.id) {
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

      // Auto-scroll to bottom
      setTimeout(scrollToBottom, 100)
    }

    const handleTypingStart = ({ userId, userName }: { userId: string, userName: string }) => {
      if (userId !== user?.userId) {
        setTypingUsers(prev => {
          const exists = prev.some(u => u.userId === userId)
          if (!exists) {
            return [...prev, { userId, userName }]
          }
          return prev
        })
      }
    }

    const handleTypingStop = ({ userId }: { userId: string }) => {
      setTypingUsers(prev => prev.filter(u => u.userId !== userId))
    }

    const handleMessageRead = ({ messageId, userId, readAt }: { messageId: string, userId: string, readAt: string }) => {
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
  }, [socket, selectedConversation, user])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchConversations = async () => {
    try {
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
  }

  const fetchMessages = async (conversationId: string) => {
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
  }

  const handleConversationSelect = (conversation: Conversation) => {
    // Leave current conversation
    if (selectedConversation) {
      leaveConversation(selectedConversation.id)
    }

    setSelectedConversation(conversation)
    setMessages([])
    setTypingUsers([])

    // Join new conversation
    joinConversation(conversation.id)
    fetchMessages(conversation.id)

    // Show mobile chat view
    if (isMobile) {
      setShowMobileChat(true)
    }
  }

  const handleSendMessage = async (content: string, messageType: 'text' | 'image' | 'file' = 'text') => {
    if (!selectedConversation || !user || sending) return

    setSending(true)
    try {
      const response = await fetch(`/api/messages/conversations/${selectedConversation.id}/messages`, {
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
        setMessages(prev => [...prev, message])

        // Send via socket
        sendMessage(selectedConversation.id, message)

        // Update conversation list
        setConversations(prev => prev.map(conv => {
          if (conv.id === selectedConversation.id) {
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
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const handleStartTyping = () => {
    if (selectedConversation && user) {
      startTyping(selectedConversation.id, user.username)
    }
  }

  const handleStopTyping = () => {
    if (selectedConversation) {
      stopTyping(selectedConversation.id)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const getConversationDisplayName = () => {
    if (!selectedConversation || !user) return ''

    if (selectedConversation.type === 'group') {
      return selectedConversation.title || 'Group Chat'
    }

    const otherParticipant = selectedConversation.participants.find(p => p.id !== user.userId)
    return otherParticipant?.name || 'Unknown User'
  }

  const getConversationStatus = () => {
    if (!selectedConversation || !user) return ''

    if (selectedConversation.type === 'group') {
      const onlineCount = selectedConversation.participants.filter(p =>
        p.id !== user.userId && onlineUsers.includes(p.id)
      ).length
      return `${selectedConversation.participants.length} members${onlineCount > 0 ? ` • ${onlineCount} online` : ''}`
    }

    const otherParticipant = selectedConversation.participants.find(p => p.id !== user.userId)
    if (otherParticipant && onlineUsers.includes(otherParticipant.id)) {
      return 'Active now'
    }
    return 'Offline'
  }

  const shouldShowSender = (message: Message, index: number) => {
    if (selectedConversation?.type !== 'group' || message.sender.id === user?.userId) {
      return false
    }

    if (index === 0) return true

    const prevMessage = messages[index - 1]
    return prevMessage.sender.id !== message.sender.id
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to access messages</p>
          <Button onClick={() => router.push('/login')}>Log In</Button>
        </div>
      </div>
    )
  }

  // Mobile view - show only chat list or chat panel
  if (isMobile) {
    if (!showMobileChat || !selectedConversation) {
      return (
        <div className="h-screen bg-gray-50">
          <ChatList
            conversations={conversations}
            selectedConversationId={selectedConversation?.id || null}
            onConversationSelect={handleConversationSelect}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            currentUserId={user.userId}
            onlineUsers={onlineUsers}
          />
        </div>
      )
    }

    // Mobile chat view
    return (
      <div className="h-screen flex flex-col bg-white">
        {/* Mobile Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMobileChat(false)}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h2 className="font-semibold text-gray-900">{getConversationDisplayName()}</h2>
              <p className="text-sm text-gray-600">{getConversationStatus()}</p>
            </div>
            <div className="flex space-x-1">
              <Button variant="ghost" size="sm" className="p-2">
                <Phone className="h-5 w-5 text-gray-600" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2">
                <Video className="h-5 w-5 text-gray-600" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2">
                <MoreVertical className="h-5 w-5 text-gray-600" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.sender.id === user.userId}
              showSender={shouldShowSender(message, index)}
              isGroupChat={selectedConversation?.type === 'group'}
              currentUserId={user.userId}
              onlineUsers={onlineUsers}
              conversationParticipants={selectedConversation?.participants.map(p => p.id) || []}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Typing Indicator */}
        <TypingIndicator
          typingUsers={typingUsers}
          isGroupChat={selectedConversation?.type === 'group'}
        />

        {/* Message Input */}
        <ChatInput
          onSendMessage={handleSendMessage}
          onStartTyping={handleStartTyping}
          onStopTyping={handleStopTyping}
          disabled={sending || !isConnected}
          placeholder={selectedConversation?.isBlocked ? "Cannot send messages" : "Type a message..."}
        />
      </div>
    )
  }

  // Desktop view
  return (
    <div className="h-screen flex bg-gray-50">
      {/* Left Panel - Chat List */}
      <div className="w-1/3 min-w-[300px] max-w-[400px] border-r border-gray-200 bg-white">
        <ChatList
          conversations={conversations}
          selectedConversationId={selectedConversation?.id || null}
          onConversationSelect={handleConversationSelect}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          currentUserId={user.userId}
          onlineUsers={onlineUsers}
        />
      </div>

      {/* Right Panel - Chat Messages */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-1">
                    <h2 className="font-semibold text-gray-900">{getConversationDisplayName()}</h2>
                    <p className="text-sm text-gray-600">{getConversationStatus()}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" className="p-2">
                    <Search className="h-5 w-5 text-gray-600" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-2">
                    <Phone className="h-5 w-5 text-gray-600" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-2">
                    <Video className="h-5 w-5 text-gray-600" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-2">
                    <MoreVertical className="h-5 w-5 text-gray-600" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
            >
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">Start the conversation</p>
                    <p className="text-sm">Send a message to get things going!</p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message, index) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isOwn={message.sender.id === user.userId}
                      showSender={shouldShowSender(message, index)}
                      isGroupChat={selectedConversation?.type === 'group'}
                      currentUserId={user.userId}
                      onlineUsers={onlineUsers}
                      conversationParticipants={selectedConversation?.participants.map(p => p.id) || []}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Typing Indicator */}
            <TypingIndicator
              typingUsers={typingUsers}
              isGroupChat={selectedConversation?.type === 'group'}
            />

            {/* Message Input */}
            <ChatInput
              onSendMessage={handleSendMessage}
              onStartTyping={handleStartTyping}
              onStopTyping={handleStopTyping}
              disabled={sending || !isConnected}
              placeholder={selectedConversation?.isBlocked ? "Cannot send messages" : "Type a message..."}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-medium mb-2">Select a conversation</h3>
              <p className="text-sm">Choose a conversation from the list to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
