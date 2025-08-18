// components/dashboard/Header.tsx
'use client'
import React, { useState, useRef, useEffect } from 'react'
import { Search, Bell, Menu, Bug, Heart, User, MessageCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { ProfileComponent } from './ProfileComponent'
import { FavoritesComponent } from './FavoritesComponent'
import { NotificationDropdown } from './NotificationDropdown'
import { ConnectionIndicator } from '@/components/debug/WebSocketStatus'
import { Room } from '@/lib/types/room'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  onMenuClick: () => void
  searchQuery: string
  onSearchChange: (query: string) => void
  onRoomSelect?: (room: Room) => void
}

export function Header({ onMenuClick, searchQuery, onSearchChange, onRoomSelect }: HeaderProps) {
  const [showBugReport, setShowBugReport] = useState(false)
  const [bugReport, setBugReport] = useState('')
  const [showProfile, setShowProfile] = useState(false)
  const [showFavorites, setShowFavorites] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [unreadMessageCount, setUnreadMessageCount] = useState(0)
  const notificationRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Fetch unread notification count on mount
  useEffect(() => {
    fetchUnreadCount()
    fetchUnreadMessageCount()

    // Poll for updates every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount()
      fetchUnreadMessageCount()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/notifications?unread=true&limit=1')
      if (response.ok) {
        const data = await response.json()
        setUnreadCount(data.unreadCount)
      }
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }

  const fetchUnreadMessageCount = async () => {
    try {
      const response = await fetch('/api/notifications?unread=true&type=message&limit=1')
      if (response.ok) {
        const data = await response.json()
        // Count only message notifications
        setUnreadMessageCount(data.notifications?.filter((n: any) => n.type === 'message').length || 0)
      }
    } catch (error) {
      console.error('Error fetching unread message count:', error)
    }
  }

  const handleBugReport = async () => {
    // API call to submit bug report
    console.log('Bug report:', bugReport)
    setBugReport('')
    setShowBugReport(false)
  }

  return (
    <>
      <header className="bg-white border-b shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left section */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CC</span>
              </div>
              <span className="font-bold text-xl text-gray-900 hidden sm:block">
                CollegeConnect
              </span>
            </div>
          </div>

          {/* Search section */}
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search for Rooms & PG..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 pr-4"
              />
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-2">
            {/* WebSocket Connection Status */}
            <div className="hidden sm:flex">
              <ConnectionIndicator />
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBugReport(true)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Bug className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Report Bug</span>
            </Button>

            {/* Notification Button with Dropdown */}
            <div className="relative" ref={notificationRef}>
              <Button
                variant="ghost"
                size="sm"
                className="relative"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Button>

              <NotificationDropdown
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
              />
            </div>

            {/* Messages Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/messages')}
              className="relative"
              title="Go to Messages"
            >
              <MessageCircle className="h-5 w-5" />
              {unreadMessageCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                </span>
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFavorites(true)}
            >
              <Heart className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowProfile(true)}
            >
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Profile Modal */}
      <ProfileComponent
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
      />

      {/* Favorites Modal */}
      <FavoritesComponent
        isOpen={showFavorites}
        onClose={() => setShowFavorites(false)}
        onRoomSelect={onRoomSelect}
      />

      {/* Bug Report Modal */}
      <Modal
        isOpen={showBugReport}
        onClose={() => setShowBugReport(false)}
        title="Report a Bug"
        className="max-w-lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe the issue you encountered:
            </label>
            <textarea
              value={bugReport}
              onChange={(e) => setBugReport(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md resize-none"
              rows={4}
              placeholder="Please provide details about the bug..."
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="ghost"
              onClick={() => setShowBugReport(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleBugReport}>
              Submit Report
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
