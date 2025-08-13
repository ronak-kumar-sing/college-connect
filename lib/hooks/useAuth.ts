// lib/hooks/useAuth.ts
'use client'
import { useState, useEffect } from 'react';

interface AuthUser {
  userId: string;
  username: string;
  userType: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/profile', {
          method: 'GET',
          credentials: 'include', // Include cookies
        });

        if (response.ok) {
          const data = await response.json();
          setUser({
            userId: data.user.id || data.user._id,
            username: data.user.username,
            userType: data.user.userType
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return { user, loading, isAuthenticated: !!user };
}
