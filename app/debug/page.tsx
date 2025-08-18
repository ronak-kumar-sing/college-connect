// app/debug/page.tsx
'use client'
import React, { useEffect, useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { useSocket } from '@/lib/contexts/SocketContext'
import { WebSocketStatus } from '@/components/debug/WebSocketStatus'
import { Button } from '@/components/ui/button'
import Cookies from 'js-cookie'

export default function DebugPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth()
  const { socket, isConnected, onlineUsers } = useSocket()
  const [tokenInfo, setTokenInfo] = useState<any>(null)
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    // Get token info
    const token = Cookies.get('token')
    setTokenInfo({
      exists: !!token,
      length: token?.length || 0,
      preview: token ? token.substring(0, 20) + '...' : 'No token'
    })

    // Get debug info
    setDebugInfo({
      userAgent: navigator.userAgent,
      protocol: window.location.protocol,
      hostname: window.location.hostname,
      port: window.location.port,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
      nodeEnv: process.env.NODE_ENV
    })
  }, [])

  const testApiCall = async () => {
    try {
      const response = await fetch('/api/auth/profile', {
        credentials: 'include'
      })
      const data = await response.json()
      console.log('API Response:', data)
      alert(`API Response: ${JSON.stringify(data, null, 2)}`)
    } catch (error) {
      console.error('API Error:', error)
      alert(`API Error: ${error}`)
    }
  }

  const testSocketConnection = () => {
    if (socket) {
      socket.connect()
    } else {
      alert('Socket not initialized')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">WebSocket Debug Page</h1>

        {/* Authentication Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Loading:</strong> {authLoading ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>User ID:</strong> {user?.userId || 'None'}
            </div>
            <div>
              <strong>Username:</strong> {user?.username || 'None'}
            </div>
            <div>
              <strong>User Type:</strong> {user?.userType || 'None'}
            </div>
            <div>
              <strong>Token Exists:</strong> {tokenInfo?.exists ? 'Yes' : 'No'}
            </div>
            <div className="col-span-2">
              <strong>Token Preview:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{tokenInfo?.preview}</code>
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={testApiCall} className="mr-2">Test Profile API</Button>
          </div>
        </div>

        {/* WebSocket Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">WebSocket Status</h2>
          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <strong>Connected:</strong> {isConnected ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Socket ID:</strong> {socket?.id || 'None'}
            </div>
            <div>
              <strong>Online Users:</strong> {onlineUsers.length}
            </div>
            <div>
              <strong>Transport:</strong> {socket?.io?.engine?.transport?.name || 'None'}
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={testSocketConnection} className="mr-2">Reconnect Socket</Button>
          </div>
        </div>

        {/* Environment Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Environment Info</h2>
          <div className="text-sm space-y-2">
            <div><strong>User Agent:</strong> {debugInfo.userAgent}</div>
            <div><strong>Protocol:</strong> {debugInfo.protocol}</div>
            <div><strong>Hostname:</strong> {debugInfo.hostname}</div>
            <div><strong>Port:</strong> {debugInfo.port}</div>
            <div><strong>Base URL:</strong> {debugInfo.baseUrl || 'Not set'}</div>
            <div><strong>Node ENV:</strong> {debugInfo.nodeEnv || 'Not set'}</div>
          </div>
        </div>

        {/* Detailed WebSocket Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <WebSocketStatus showDetails={true} />
        </div>
      </div>
    </div>
  )
}
