'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import OwnerSidebar from '@/components/owner/OwnerSidebar';
import OwnerHeader from '@/components/owner/OwnerHeader';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/profile');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <OwnerSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        user={user}
      />

      <div className={`flex-1 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'} transition-all duration-300`}>
        <OwnerHeader
          user={user}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
