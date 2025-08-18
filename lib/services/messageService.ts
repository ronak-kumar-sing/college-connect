// lib/services/messageService.ts
import { Message, Conversation } from '../types/message'

export class MessageService {
  private baseUrl: string

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '')
  }

  async getConversations(page = 1, limit = 20, search = '') {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search })
    })

    const response = await fetch(`${this.baseUrl}/api/messages/conversations?${params}`, {
      method: 'GET',
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error('Failed to fetch conversations')
    }

    return response.json()
  }

  async getMessages(conversationId: string, page = 1, limit = 50, before?: string) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(before && { before })
    })

    const response = await fetch(`${this.baseUrl}/api/messages/conversations/${conversationId}/messages?${params}`, {
      method: 'GET',
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error('Failed to fetch messages')
    }

    return response.json()
  }

  async sendMessage(conversationId: string, content: string, messageType: 'text' | 'image' | 'file' = 'text', attachments?: any[], replyTo?: string) {
    const response = await fetch(`${this.baseUrl}/api/messages/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        content,
        messageType,
        attachments,
        replyTo
      })
    })

    if (!response.ok) {
      throw new Error('Failed to send message')
    }

    return response.json()
  }

  async createConversation(participants: string[], type: 'direct' | 'group' = 'direct', title?: string, metadata?: any) {
    const response = await fetch(`${this.baseUrl}/api/messages/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        participants,
        type,
        title,
        metadata
      })
    })

    if (!response.ok) {
      throw new Error('Failed to create conversation')
    }

    return response.json()
  }

  async markMessagesAsRead(conversationId: string, messageIds?: string[]) {
    const response = await fetch(`${this.baseUrl}/api/messages/conversations/${conversationId}/read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        messageIds
      })
    })

    if (!response.ok) {
      throw new Error('Failed to mark messages as read')
    }

    return response.json()
  }

  async archiveConversation(conversationId: string) {
    const response = await fetch(`${this.baseUrl}/api/messages/conversations/${conversationId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        archived: true
      })
    })

    if (!response.ok) {
      throw new Error('Failed to archive conversation')
    }

    return response.json()
  }

  async deleteMessage(conversationId: string, messageId: string) {
    const response = await fetch(`${this.baseUrl}/api/messages/conversations/${conversationId}/messages/${messageId}`, {
      method: 'DELETE',
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error('Failed to delete message')
    }

    return response.json()
  }

  async editMessage(conversationId: string, messageId: string, newContent: string) {
    const response = await fetch(`${this.baseUrl}/api/messages/conversations/${conversationId}/messages/${messageId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        content: newContent
      })
    })

    if (!response.ok) {
      throw new Error('Failed to edit message')
    }

    return response.json()
  }
}

export const messageService = new MessageService()
