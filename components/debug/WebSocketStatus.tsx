// components/debug/WebSocketStatus.tsx
'use client'
import React, { useState, useEffect } from 'react'
import { useSocket } from '@/lib/contexts/SocketContext'
import { useAuth } from '@/lib/hooks/useAuth'
import { Badge } from '@/components/ui/badge'

interface WebSocketStatusProps {
  showDetails?: boolean
  className?: string
}

export function WebSocketStatus({ showDetails = false, className = "" }: WebSocketStatusProps) {
  const { socket, isConnected, onlineUsers } = useSocket()
  const { user } = useAuth()
  const [connectionHistory, setConnectionHistory] = useState<string[]>([])

  useEffect(() => {
    if (socket) {
      const logEvent = (event: string, data?: any) => {
        const timestamp = new Date().toLocaleTimeString()
        const logEntry = `${timestamp}: ${event}${data ? ` - ${JSON.stringify(data).substring(0, 50)}` : ''}`
        setConnectionHistory(prev => [logEntry, ...prev.slice(0, 9)]) // Keep last 10 events
      }

      // Connection events
      socket.on('connect', () => logEvent('Connected', { id: socket.id }))
      socket.on('disconnect', (reason) => logEvent('Disconnected', { reason }))
      socket.on('connect_error', (error) => logEvent('Connection Error', { error: error.message }))

      // Message events
      socket.on('message:receive', (data) => logEvent('Message Received'))
      socket.on('user:online', (data) => logEvent('User Online', { userId: data.userId }))
      socket.on('user:offline', (data) => logEvent('User Offline', { userId: data.userId }))

      return () => {
        socket.off('connect')
        socket.off('disconnect')
        socket.off('connect_error')
        socket.off('message:receive')
        socket.off('user:online')
        socket.off('user:offline')
      }
    }
  }, [socket])

  if (!showDetails) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span className="text-xs text-gray-600">
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
    )
  }

  return (
    <div className={`bg-gray-50 border rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-900">WebSocket Status</h3>
        <Badge variant={isConnected ? 'success' : 'destructive'}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-600">Socket ID:</span>
          <div className="font-mono text-xs text-gray-800 break-all">
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
          <span className="text-gray-600">Online Users:</span>
          <div className="font-mono text-xs text-gray-800">
            {onlineUsers.length}
          </div>
        </div>
      </div>

      {connectionHistory.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Events</h4>
          <div className="bg-white rounded border max-h-32 overflow-y-auto">
            {connectionHistory.map((event, index) => (
              <div key={index} className="px-2 py-1 text-xs font-mono text-gray-600 border-b last:border-b-0">
                {event}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex space-x-2 mt-4">
        <button
          onClick={() => socket?.connect()}
          disabled={isConnected}
          className="px-3 py-1 text-xs bg-blue-500 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Connect
        </button>

        <button
          onClick={() => socket?.disconnect()}
          disabled={!isConnected}
          className="px-3 py-1 text-xs bg-red-500 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Disconnect
        </button>

        <button
          onClick={() => setConnectionHistory([])}
          className="px-3 py-1 text-xs bg-gray-500 text-white rounded"
        >
          Clear Log
        </button>
      </div>
    </div>
  )
}

// Simple connection indicator for header/navbar
export function ConnectionIndicator() {
  const { isConnected } = useSocket()

  return (
    <div className="flex items-center space-x-1">
      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
      <span className="text-xs text-gray-500">
        {isConnected ? 'Live' : 'Offline'}
      </span>
    </div>
  )
}
