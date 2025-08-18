// components/debug/WebSocketStatusBar.tsx
'use client'
import React, { useState } from 'react'
import { useSocket } from '@/lib/contexts/SocketContext'
import { useAuth } from '@/lib/hooks/useAuth'
import { Wifi, WifiOff, ChevronDown, ChevronUp, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function WebSocketStatusBar() {
  const { socket, isConnected, onlineUsers } = useSocket()
  const { user } = useAuth()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 ${isConnected
        ? 'bg-green-50 border-b border-green-200'
        : 'bg-red-50 border-b border-red-200'
      }`}>
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <Wifi className="h-4 w-4 text-green-600" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-600" />
            )}
            <span className={`text-sm font-medium ${isConnected ? 'text-green-700' : 'text-red-700'
              }`}>
              WebSocket {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          {isConnected && (
            <Badge variant="secondary" className="text-xs">
              {onlineUsers.length} users online
            </Badge>
          )}

          {!isConnected && !user && (
            <span className="text-xs text-red-600">
              Please log in to enable real-time features
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded hover:bg-gray-100"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-600" />
            )}
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 rounded hover:bg-gray-100"
          >
            <X className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-3 border-t bg-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
            <div>
              <span className="text-gray-600">Socket ID:</span>
              <div className="font-mono text-xs text-gray-800 truncate">
                {socket?.id || 'Not connected'}
              </div>
            </div>

            <div>
              <span className="text-gray-600">Transport:</span>
              <div className="font-mono text-xs text-gray-800">
                {socket?.io?.engine?.transport?.name || 'N/A'}
              </div>
            </div>

            <div>
              <span className="text-gray-600">User:</span>
              <div className="font-mono text-xs text-gray-800">
                {user?.username || 'Not authenticated'}
              </div>
            </div>

            <div>
              <span className="text-gray-600">Status:</span>
              <div className="font-mono text-xs">
                <Badge variant={isConnected ? 'success' : 'destructive'}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>
            </div>
          </div>

          {!isConnected && (
            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
              <strong>Connection Issues?</strong>
              <ul className="mt-1 text-xs text-gray-600">
                <li>• Make sure you are logged in</li>
                <li>• Check your internet connection</li>
                <li>• The server might be starting up</li>
                <li>• Try refreshing the page</li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Spacer component to push content down when status bar is visible
export function WebSocketStatusSpacer() {
  return <div className="h-12" />
}
