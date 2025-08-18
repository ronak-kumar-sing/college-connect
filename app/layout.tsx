// app/layout.tsx
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { SocketProvider } from '@/lib/contexts/SocketContext'
import { WebSocketStatusBar, WebSocketStatusSpacer } from '@/components/debug/WebSocketStatusBar'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <SocketProvider>
          <WebSocketStatusBar />
          <WebSocketStatusSpacer />
          {children}
        </SocketProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
