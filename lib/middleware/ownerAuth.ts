import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export interface OwnerAuthRequest extends NextRequest {
  userId?: string;
  user?: any;
}

export async function ownerAuth(request: NextRequest): Promise<{ success: boolean; userId?: string; user?: any; response?: NextResponse }> {
  try {
    const token = request.cookies.get('token')?.value || request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return {
        success: false,
        response: NextResponse.json({ error: 'No token provided' }, { status: 401 })
      };
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

    await connectDB();
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return {
        success: false,
        response: NextResponse.json({ error: 'User not found' }, { status: 401 })
      };
    }

    // Check if user has properties (is an owner) - you might want to adjust this logic
    // based on how you determine ownership in your app
    return {
      success: true,
      userId: user._id.toString(),
      user: user
    };

  } catch (error) {
    return {
      success: false,
      response: NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    };
  }
}

export function withOwnerAuth(handler: (req: NextRequest, context: { userId: string; user: any }) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    const authResult = await ownerAuth(req);

    if (!authResult.success) {
      return authResult.response!;
    }

    return handler(req, { userId: authResult.userId!, user: authResult.user });
  };
}
