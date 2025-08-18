// lib/contexts/SocketContext.tsx
'use client'
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/lib/hooks/useAuth';
import Cookies from 'js-cookie';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: string[];
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  sendMessage: (conversationId: string, message: any) => void;
  startTyping: (conversationId: string, userName: string) => void;
  stopTyping: (conversationId: string) => void;
  markMessageRead: (conversationId: string, messageId: string) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  onlineUsers: [],
  joinConversation: () => { },
  leaveConversation: () => { },
  sendMessage: () => { },
  startTyping: () => { },
  stopTyping: () => { },
  markMessageRead: () => { },
});

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const token = Cookies.get('token');

      if (token) {
        // Initialize socket connection
        const newSocket = io(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000', {
          auth: {
            token: token
          },
          transports: ['websocket', 'polling']
        });

        // Connection events
        newSocket.on('connect', () => {
          console.log('✅ WebSocket connected:', newSocket.id);
          setIsConnected(true);
          setSocket(newSocket);
        });

        newSocket.on('disconnect', (reason) => {
          console.log('❌ WebSocket disconnected:', reason);
          setIsConnected(false);
        });

        newSocket.on('connect_error', (error) => {
          console.error('🔥 WebSocket connection error:', error);
          setIsConnected(false);
        });

        // User status events
        newSocket.on('user:online', (data) => {
          setOnlineUsers(prev => {
            if (!prev.includes(data.userId)) {
              return [...prev, data.userId];
            }
            return prev;
          });
        });

        newSocket.on('user:offline', (data) => {
          setOnlineUsers(prev => prev.filter(userId => userId !== data.userId));
        });

        // Get initial online users
        newSocket.emit('users:online', (users: any[]) => {
          setOnlineUsers(users.map(u => u.userId));
        });

        setSocket(newSocket);

        return () => {
          newSocket.close();
          setSocket(null);
          setIsConnected(false);
        };
      }
    }
  }, [user]);

  const joinConversation = (conversationId: string) => {
    if (socket) {
      socket.emit('join:conversation', conversationId);
    }
  };

  const leaveConversation = (conversationId: string) => {
    if (socket) {
      socket.emit('leave:conversation', conversationId);
    }
  };

  const sendMessage = (conversationId: string, message: any) => {
    if (socket) {
      socket.emit('message:send', { conversationId, message });
    }
  };

  const startTyping = (conversationId: string, userName: string) => {
    if (socket) {
      socket.emit('typing:start', { conversationId, userName });
    }
  };

  const stopTyping = (conversationId: string) => {
    if (socket) {
      socket.emit('typing:stop', { conversationId });
    }
  };

  const markMessageRead = (conversationId: string, messageId: string) => {
    if (socket) {
      socket.emit('message:read', { conversationId, messageId });
    }
  };

  const value = {
    socket,
    isConnected,
    onlineUsers,
    joinConversation,
    leaveConversation,
    sendMessage,
    startTyping,
    stopTyping,
    markMessageRead,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
