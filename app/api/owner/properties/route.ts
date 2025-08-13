import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Room from '@/models/Room';
import { ownerAuth } from '@/lib/middleware/ownerAuth';

export async function GET(request: NextRequest) {
  const authResult = await ownerAuth(request);

  if (!authResult.success) {
    return authResult.response!;
  }

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    const skip = (page - 1) * limit;
    const ownerId = authResult.userId;

    // Build query
    let query: any = { 'owner.id': ownerId };

    if (status === 'available') {
      query['availability.available'] = true;
    } else if (status === 'occupied') {
      query['availability.occupiedBeds'] = { $gt: 0 };
    }

    if (type) {
      query.type = type;
    }

    const properties = await Room.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Room.countDocuments(query);

    const formattedProperties = properties.map(property => ({
      id: property._id.toString(),
      title: property.title,
      type: property.type,
      rent: property.rent,
      location: property.location,
      images: property.images,
      availability: property.availability,
      rating: property.rating,
      totalReviews: property.totalReviews,
      createdAt: property.createdAt,
      features: property.features
    }));

    return NextResponse.json({
      success: true,
      properties: formattedProperties,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Properties API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authResult = await ownerAuth(request);

  if (!authResult.success) {
    return authResult.response!;
  }

  try {
    await connectDB();

    const body = await request.json();
    const ownerId = authResult.userId;
    const user = authResult.user;

    // Validate required fields
    const requiredFields = ['title', 'type', 'rent', 'deposit', 'location', 'description'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Create property data
    const propertyData = {
      ...body,
      owner: {
        id: ownerId,
        name: user.name,
        phone: user.phone,
        email: user.email,
        verified: user.verified || false,
        rating: 0
      },
      rating: 0,
      totalReviews: 0,
      reviews: []
    };

    const property = new Room(propertyData);
    await property.save();

    return NextResponse.json({
      success: true,
      property: {
        id: property._id.toString(),
        title: property.title,
        type: property.type,
        rent: property.rent,
        location: property.location
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Create property error:', error);
    return NextResponse.json(
      { error: 'Failed to create property' },
      { status: 500 }
    );
  }
}
