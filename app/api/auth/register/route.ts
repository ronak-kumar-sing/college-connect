// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User, { IUser } from '@/models/User';
import { sendNotification, NotificationTemplates } from '@/lib/utils/notifications';

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectDB();

    const body = await request.json();
    const {
      username,
      name,
      email,
      phone,
      password,
      userType,
      collegeRegistrationNo,
      college,
      department,
      year,
      designation
    } = body;

    // Validation
    if (!username || !name || !email || !phone || !password || !userType) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    // Additional validation for students and faculty
    if ((userType === 'student' || userType === 'faculty') && !collegeRegistrationNo) {
      return NextResponse.json(
        { error: 'College Registration Number is required for students and faculty' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email },
        { username },
        { phone },
        ...(collegeRegistrationNo ? [{ collegeRegistrationNo }] : [])
      ]
    });

    if (existingUser) {
      let errorField = 'User';
      if (existingUser.email === email) errorField = 'Email';
      else if (existingUser.username === username) errorField = 'Username';
      else if (existingUser.phone === phone) errorField = 'Phone';
      else if (existingUser.collegeRegistrationNo === collegeRegistrationNo) errorField = 'College Registration Number';

      return NextResponse.json(
        { error: `${errorField} already exists` },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user object
    const userData: Partial<IUser> = {
      username,
      name,
      email,
      phone,
      password: hashedPassword,
      userType
    };

    // Add conditional fields
    if (collegeRegistrationNo) userData.collegeRegistrationNo = collegeRegistrationNo;
    if (college) userData.college = college;
    if (department) userData.department = department;
    if (year && userType === 'student') userData.year = year;
    if (designation && userType === 'faculty') userData.designation = designation;

    // Create user
    const user = new User(userData);
    await user.save();

    // Send welcome notification
    try {
      await sendNotification(
        user._id.toString(),
        NotificationTemplates.WELCOME_NEW_USER(user.name),
        undefined, // No sender for system notifications
        { isWelcome: true }
      )
    } catch (notifError) {
      console.error('Error sending welcome notification:', notifError)
      // Continue without failing registration
    }

    // Remove password from response
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
      verified: user.verified,
      createdAt: user.createdAt
    };

    return NextResponse.json({
      message: 'User registered successfully',
      user: userResponse
    }, { status: 201 });

  } catch (error: unknown) {
    console.error('Registration error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Handle specific MongoDB errors
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      const field = error && typeof error === 'object' && 'keyPattern' in error ?
        Object.keys((error as any).keyPattern)[0] : 'field';
      return NextResponse.json(
        { error: `${field} already exists` },
        { status: 409 }
      );
    }

    // Handle validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Handle authentication errors
    if (errorMessage.includes('authentication failed') || errorMessage.includes('bad auth')) {
      return NextResponse.json(
        { error: 'Database connection error. Please try again later.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: errorMessage || 'Internal server error' },
      { status: 500 }
    );
  }
}
