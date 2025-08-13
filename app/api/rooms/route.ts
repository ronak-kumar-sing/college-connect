// app/api/rooms/route.ts
import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Room from '@/models/Room'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const search = searchParams.get('search') || ''
    const id = searchParams.get('id')

    // If ID is provided, fetch a specific room
    if (id) {
      try {
        const room = await Room.findById(id)
          .populate('owner', 'name phone email verified rating')

        if (!room) {
          return NextResponse.json(
            { error: 'Room not found' },
            { status: 404 }
          )
        }

        // Transform _id to id for frontend compatibility
        const roomObj = room.toObject()
        const transformedRoom = {
          ...roomObj,
          id: roomObj._id.toString(),
          owner: roomObj.owner ? {
            ...roomObj.owner,
            id: roomObj.owner._id?.toString() || roomObj.owner.id || roomObj.owner._id
          } : null
        }

        return NextResponse.json({
          rooms: [transformedRoom]
        })
      } catch (error) {
        console.error('Error fetching single room:', error)
        return NextResponse.json(
          { error: 'Failed to fetch room' },
          { status: 500 }
        )
      }
    }

    // Build query based on filters
    const query: any = {}

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { 'location.area': { $regex: search, $options: 'i' } },
        { amenities: { $in: [new RegExp(search, 'i')] } }
      ]
    }

    // Add more filter logic here

    const rooms = await Room.find(query)
      .populate('owner', 'name phone email verified rating')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    const total = await Room.countDocuments(query)

    console.log(`Found ${rooms.length} rooms out of ${total} total`)

    // Transform _id to id for frontend compatibility
    const transformedRooms = rooms.map((room, index) => {
      try {
        const roomObj = room.toObject()
        return {
          ...roomObj,
          id: roomObj._id.toString(),
          owner: roomObj.owner ? {
            ...roomObj.owner,
            id: roomObj.owner._id?.toString() || roomObj.owner.id || roomObj.owner._id
          } : null
        }
      } catch (error) {
        console.error(`Error transforming room at index ${index}:`, error)
        return null
      }
    }).filter(Boolean)

    console.log(`Successfully transformed ${transformedRooms.length} rooms`)

    return NextResponse.json({
      rooms: transformedRooms,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: page * limit < total
      }
    })
  } catch (error) {
    console.error('Error in GET /api/rooms:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rooms' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const roomData = await request.json()
    const room = new Room(roomData)
    await room.save()

    return NextResponse.json(room, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    )
  }
}
