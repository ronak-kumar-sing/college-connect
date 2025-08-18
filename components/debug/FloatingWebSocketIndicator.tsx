// components/debug/FloatingWebSocketIndicator.tsx
'use client'
import React, { useState } from 'react'
import { useSocket } from '@/lib/contexts/SocketContext'
import { useAuth } from '@/lib/hooks/useAuth'
import { Wifi, WifiOff, AlertCircle, CheckCircle2 } from 'lucide-react'

export function FloatingWebSocketIndicator() {
  const { socket, isConnected, onlineUsers } = useSocket()
  const { user } = useAuth()
  const [showTooltip, setShowTooltip] = useState(false)

  const getStatusColor = () => {
    if (!user) return 'bg-gray-500'
    return isConnected ? 'bg-green-500' : 'bg-red-500'
  }

  const getStatusIcon = () => {
    if (!user) return <AlertCircle className="h-4 w-4 text-white" />
    return isConnected ? (
      <CheckCircle2 className="h-4 w-4 text-white" />
    ) : (
      <WifiOff className="h-4 w-4 text-white" />
    )
  }

  const getStatusText = () => {
    if (!user) return 'Not logged in'
    return isConnected ? 'Connected' : 'Disconnected'
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className="relative"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* Floating Button */}
        <div className={`${getStatusColor()} rounded-full p-3 shadow-lg cursor-pointer transition-all duration-200 hover:scale-110`}>
          {getStatusIcon()}
          {/* Connection pulse animation when connected */}
          {isConnected && user && (
            <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-25"></div>
          )}
        </div>

        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap">
            <div className="flex items-center space-x-2">
              <span>{getStatusText()}</span>
              {isConnected && (
                <span className="text-green-300">({onlineUsers.length} online)</span>
              )}
            </div>
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
          </div>
        )}
      </div>
    </div>
  )
}
