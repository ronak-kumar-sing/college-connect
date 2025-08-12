// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { login, password } = body; // login can be username or phone

    if (!login || !password) {
      return NextResponse.json(
        { error: 'Login credentials and password are required' },
        { status: 400 }
      );
    }

    // Find user by username or phone
    const user = await User.findOne({
      $or: [
        { username: login.toLowerCase() },
        { phone: login }
      ]
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        userType: user.userType
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // User response without password
    const userResponse = {
      id: user._id,
      username: user.username,
      name: user.name,
      email: user.email,
      phone: user.phone,
      userType: user.userType,
      collegeRegistrationNo: user.collegeRegistrationNo,
      college: user.college,
      department: user.department,
      year: user.year,
      designation: user.designation,
      verified: user.verified
    };

    const response = NextResponse.json({
      message: 'Login successful',
      user: userResponse,
      token
    });

    // Set HTTP-only cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return response;

  } catch (error: unknown) {
    console.error('Login error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
