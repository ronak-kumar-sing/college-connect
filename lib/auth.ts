// lib/auth.ts
import jwt from 'jsonwebtoken';

export interface AuthUser {
  userId: string;
  username: string;
  userType: string;
}

export function getUserFromToken(token: string): AuthUser | null {
  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

export function getTokenFromCookie(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const cookies = document.cookie.split(';');
  const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));

  if (tokenCookie) {
    return tokenCookie.split('=')[1];
  }

  return null;
}

export function getCurrentUser(): AuthUser | null {
  const token = getTokenFromCookie();
  if (!token) {
    return null;
  }

  return getUserFromToken(token);
}
