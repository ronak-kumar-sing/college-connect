import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { withAuth } from '@/lib/middleware/auth'

export const GET = withAuth(async (request: NextRequest, { userId }) => {
  try {
    await connectDB()

    const user = await User.findById(userId).select('-password')

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
})

export const PUT = withAuth(async (request: NextRequest, { userId }) => {
  try {
    await connectDB()

    const body = await request.json()
    const updateData = body

    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updateData.password
    delete updateData.verified
    delete updateData.favorites
    delete updateData.createdAt

    const user = await User.findByIdAndUpdate(
      userId,
      { ...updateData, updatedAt: new Date() },
      { new: true, select: '-password' }
    )

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
})