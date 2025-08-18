import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Room from '@/models/Room'
import User from '@/models/User'
import { withAuth } from '@/lib/middleware/auth'
import { sendNotification, NotificationTemplates } from '@/lib/utils/notifications'

export const GET = withAuth(async (request: NextRequest, { userId }) => {
  try {
    await connectDB()

    const user = await User.findById(userId).populate('favorites')

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ favorites: user.favorites })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    )
  }
})

export const POST = withAuth(async (request: NextRequest, { userId }) => {
  try {
    await connectDB()

    const body = await request.json()
    const { roomId } = body

    if (!roomId) {
      console.log('POST /api/rooms/favorites - Error: Room ID is missing')
      return NextResponse.json(
        { error: 'Room ID is required' },
        { status: 400 }
      )
    }

    const user = await User.findById(userId)
    const room = await Room.findById(roomId)

    if (!user || !room) {
      console.log('POST /api/rooms/favorites - Error: User or Room not found', { user: !!user, room: !!room })
      return NextResponse.json(
        { error: 'User or Room not found' },
        { status: 404 }
      )
    }

    // Toggle favorite
    const isFavorite = user.favorites.includes(roomId)

    if (isFavorite) {
      user.favorites = user.favorites.filter((id: any) => id.toString() !== roomId)
    } else {
      user.favorites.push(roomId)

      // Send notification to room owner when someone favorites their room
      if (room.owner && room.owner.id) {
        try {
          await sendNotification(
            room.owner.id,
            NotificationTemplates.ROOM_FAVORITED(room.title, user.name, roomId),
            userId,
            { roomId, userId }
          )
        } catch (notifError) {
          console.error('Error sending favorite notification:', notifError)
          // Continue without failing the request
        }
      }
    }

    await user.save()

    console.log('POST /api/rooms/favorites - Success:', { isFavorite: !isFavorite })

    return NextResponse.json({
      isFavorite: !isFavorite,
      message: isFavorite ? 'Removed from favorites' : 'Added to favorites'
    })
  } catch (error) {
    console.error('POST /api/rooms/favorites - Error:', error)
    return NextResponse.json(
      { error: 'Failed to update favorites' },
      { status: 500 }
    )
  }
})

export const DELETE = withAuth(async (request: NextRequest, { userId }) => {
  try {
    await connectDB()

    const body = await request.json()
    const { roomId } = body

    if (!roomId) {
      return NextResponse.json(
        { error: 'Room ID is required' },
        { status: 400 }
      )
    }

    const user = await User.findById(userId)

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Remove from favorites
    user.favorites = user.favorites.filter((id: any) => id.toString() !== roomId)
    await user.save()

    return NextResponse.json({
      message: 'Removed from favorites'
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to remove from favorites' },
      { status: 500 }
    )
  }
})
