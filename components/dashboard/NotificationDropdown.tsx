'use client'
import React, { useState, useEffect } from 'react'
import { Bell, Check, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface Notification {
  id: string
  type: 'message' | 'booking' | 'property' | 'system' | 'favorite' | 'review'
  title: string
  message: string
  data?: any
  read: boolean
  actionUrl?: string
  priority: 'low' | 'medium' | 'high'
  sender?: {
    id: string
    name: string
    username: string
  }
  createdAt: string
}

interface NotificationDropdownProps {
  isOpen: boolean
  onClose: () => void
}

export function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen])

  const fetchNotifications = async (pageNum = 1, reset = false) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/notifications?page=${pageNum}&limit=10`)

      if (response.ok) {
        const data = await response.json()

        if (reset) {
          setNotifications(data.notifications)
        } else {
          setNotifications(prev => [...prev, ...data.notifications])
        }

        setUnreadCount(data.unreadCount)
        setHasMore(data.pagination.hasMore)
        setPage(pageNum)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true })
      })

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === notificationId ? { ...notif, read: true } : notif
          )
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const wasUnread = notifications.find(n => n.id === notificationId)?.read === false
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId))
        if (wasUnread) {
          setUnreadCount(prev => Math.max(0, prev - 1))
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_as_read', markAllAsRead: true })
      })

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif => ({ ...notif, read: true }))
        )
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }

    // Handle message notifications specifically
    if (notification.type === 'message') {
      // Close dropdown first
      onClose()

      // Navigate to messages screen
      if (notification.data?.conversationId) {
        // If we have a specific conversation ID, navigate there
        router.push(`/messages?conversation=${notification.data.conversationId}`)
      } else {
        // Otherwise, just go to the messages page
        router.push('/messages')
      }
      return
    }

    // Handle other notification types
    if (notification.actionUrl) {
      if (notification.actionUrl.startsWith('/')) {
        // Use router for internal navigation
        onClose()
        router.push(notification.actionUrl)
      } else {
        // Use window.location for external URLs
        window.location.href = notification.actionUrl
        onClose()
      }
    } else {
      onClose()
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message': return '💬'
      case 'booking': return '📅'
      case 'property': return '🏠'
      case 'system': return '⚙️'
      case 'favorite': return '❤️'
      case 'review': return '⭐'
      default: return '🔔'
    }
  }

  const getNotificationClickableIcon = (type: string) => {
    switch (type) {
      case 'message':
        return (
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-lg">💬</span>
          </div>
        )
      case 'booking':
        return (
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-lg">📅</span>
          </div>
        )
      case 'property':
        return (
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <span className="text-lg">🏠</span>
          </div>
        )
      case 'system':
        return (
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-lg">⚙️</span>
          </div>
        )
      case 'favorite':
        return (
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-lg">❤️</span>
          </div>
        )
      case 'review':
        return (
          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
            <span className="text-lg">⭐</span>
          </div>
        )
      default:
        return (
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-lg">🔔</span>
          </div>
        )
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500'
      case 'medium': return 'border-l-yellow-500'
      case 'low': return 'border-l-blue-500'
      default: return 'border-l-gray-500'
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60)
      return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  if (!isOpen) return null

  return (
    <div className="absolute right-0 top-full mt-2 w-96 bg-white border rounded-lg shadow-xl z-50 max-h-96 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5" />
          <span className="font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-blue-600 hover:text-blue-700"
            >
              <Check className="h-4 w-4 mr-1" />
              Mark all read
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto">
        {loading && notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No notifications yet
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`border-l-4 ${getPriorityColor(notification.priority)} ${!notification.read ? 'bg-blue-50' : 'bg-white'
                } hover:bg-gray-50 cursor-pointer transition-colors`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="p-4 relative group">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {getNotificationClickableIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        {notification.sender && (
                          <p className="text-xs text-gray-500 mt-1">
                            From: {notification.sender.name}
                          </p>
                        )}
                        {notification.type === 'message' && (
                          <p className="text-xs text-blue-600 mt-1 font-medium">
                            Click to open messages
                          </p>
                        )}
                      </div>

                      <div className="flex items-center space-x-1 ml-2">
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNotification(notification.id)
                          }}
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2">
                      {formatTime(notification.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Load More Button */}
        {hasMore && !loading && (
          <div className="p-4 border-t">
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => fetchNotifications(page + 1)}
            >
              Load more notifications
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
