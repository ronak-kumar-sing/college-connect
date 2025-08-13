// lib/middleware/auth.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not defined');
}

export interface AuthRequest extends NextRequest {
  userId?: string;
  user?: any;
}

export async function authenticate(request: NextRequest): Promise<{ success: boolean; userId?: string; user?: any; response?: NextResponse }> {
  try {
    const token = request.cookies.get('token')?.value || request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return {
        success: false,
        response: NextResponse.json({ error: 'No token provided' }, { status: 401 })
      };
    }

    const decoded = jwt.verify(token, JWT_SECRET!) as jwt.JwtPayload & { userId: string };

    await connectDB();
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return {
        success: false,
        response: NextResponse.json({ error: 'User not found' }, { status: 401 })
      };
    }

    return {
      success: true,
      userId: user._id.toString(),
      user: user
    };

  } catch (error) {
    console.error('Authentication error:', error);
    return {
      success: false,
      response: NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    };
  }
}

export function withAuth(handler: (req: NextRequest, context: { userId: string; user: any }) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    const authResult = await authenticate(req);

    if (!authResult.success) {
      return authResult.response!;
    }

    return handler(req, { userId: authResult.userId!, user: authResult.user });
  };
}
