'use client'
import React, { useState } from 'react'
import { MessageCircle, Send, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { messageService } from '@/lib/services/messageService'

interface MessageOwnerProps {
  propertyId: string
  ownerId: string
  ownerName: string
  propertyTitle: string
}

export function MessageOwner({ propertyId, ownerId, ownerName, propertyTitle }: MessageOwnerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const sendMessage = async () => {
    if (!message.trim() || sending) return

    setSending(true)
    try {
      // First, create or get conversation
      const conversationResponse = await messageService.createConversation(
        [ownerId],
        'direct',
        undefined,
        { propertyId }
      )

      if (conversationResponse.conversation) {
        const conversationId = conversationResponse.conversation.id

        // Send the message with proper content
        const fullMessage = `Hi ${ownerName}, I'm interested in your property "${propertyTitle}". ${message}`
        
        const messageResponse = await messageService.sendMessage(
          conversationId,
          fullMessage,
          'text'
        )

        if (messageResponse.message) {
          setSent(true)
          setMessage('')
          setTimeout(() => {
            setIsOpen(false)
            setSent(false)
          }, 2000)
        } else {
          throw new Error('Failed to send message')
        }
      } else {
        throw new Error('Failed to create conversation')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const openMessagesPage = () => {
    window.open('/messages', '_blank')
  }

  if (sent) {
    return (
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Message Sent">
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Message Sent!</h3>
          <p className="text-gray-600 mb-4">
            Your message has been sent to {ownerName}. They will be notified and can respond directly.
          </p>
          <Button onClick={openMessagesPage} className="mr-2">
            View Messages
          </Button>
          <Button variant="ghost" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </div>
      </Modal>
    )
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        <MessageCircle className="h-4 w-4 mr-2" />
        Message Owner
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={`Message ${ownerName}`}
        className="max-w-lg"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-3">
              Send a message about <strong>{propertyTitle}</strong>
            </p>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi, I'm interested in your property. Could you tell me more about..."
              className="w-full p-3 border border-gray-300 rounded-md resize-none"
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {message.length}/500 characters
            </p>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="ghost"
              onClick={() => setIsOpen(false)}
              disabled={sending}
            >
              Cancel
            </Button>
            <Button
              onClick={sendMessage}
              disabled={!message.trim() || sending}
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

        if (messageResponse.ok) {
          setSent(true)
          setMessage('')
          setTimeout(() => {
            setIsOpen(false)
            setSent(false)
          }, 2000)
        } else {
          throw new Error('Failed to send message')
        }
      } else {
        throw new Error('Failed to create conversation')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const openMessagesPage = () => {
    window.open('/messages', '_blank')
  }

  if (sent) {
    return (
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Message Sent">
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Message Sent!</h3>
          <p className="text-gray-600 mb-4">
            Your message has been sent to {ownerName}. They will be notified and can respond directly.
          </p>
          <Button onClick={openMessagesPage} className="mr-2">
            View Messages
          </Button>
          <Button variant="ghost" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </div>
      </Modal>
    )
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        <MessageCircle className="h-4 w-4 mr-2" />
        Message Owner
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={`Message ${ownerName}`}
        className="max-w-lg"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-3">
              Send a message about <strong>{propertyTitle}</strong>
            </p>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi, I'm interested in your property. Could you tell me more about..."
              className="w-full p-3 border border-gray-300 rounded-md resize-none"
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {message.length}/500 characters
            </p>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="ghost"
              onClick={() => setIsOpen(false)}
              disabled={sending}
            >
              Cancel
            </Button>
            <Button
              onClick={sendMessage}
              disabled={!message.trim() || sending}
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
