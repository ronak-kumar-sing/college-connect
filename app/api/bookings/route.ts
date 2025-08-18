// app/api/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Room from '@/models/Room';
import User from '@/models/User';
import { withAuth } from '@/lib/middleware/auth';
import { sendNotification, NotificationTemplates } from '@/lib/utils/notifications';

// Get bookings for the authenticated user
export const GET = withAuth(async (request: NextRequest, { userId }) => {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');

    const skip = (page - 1) * limit;

    // Build query
    let query: any = { tenant: userId };

    if (status) {
      query.status = status;
    }

    // Get bookings
    const bookings = await Booking.find(query)
      .populate('property', 'title type images location rent')
      .populate('owner', 'name phone email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    // Get total count for pagination
    const total = await Booking.countDocuments(query);

    return NextResponse.json({
      bookings: bookings.map((booking: any) => ({
        id: booking._id.toString(),
        property: booking.property ? {
          id: booking.property._id.toString(),
          title: booking.property.title,
          type: booking.property.type,
          images: booking.property.images,
          location: booking.property.location,
          rent: booking.property.rent
        } : null,
        owner: booking.owner ? {
          id: booking.owner._id.toString(),
          name: booking.owner.name,
          phone: booking.owner.phone,
          email: booking.owner.email
        } : null,
        status: booking.status,
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        guests: booking.guests,
        totalAmount: booking.totalAmount,
        paymentStatus: booking.paymentStatus,
        bookingDate: booking.bookingDate,
        moveInDate: booking.moveInDate,
        moveOutDate: booking.moveOutDate,
        notes: booking.notes,
        createdAt: booking.createdAt
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: page * limit < total
      }
    });

  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
});

// Create a new booking
export const POST = withAuth(async (request: NextRequest, { userId, user }) => {
  try {
    await connectDB();

    const body = await request.json();
    const {
      propertyId,
      checkInDate,
      checkOutDate,
      guests,
      notes,
      moveInDate,
      moveOutDate
    } = body;

    // Validate required fields
    if (!propertyId || !checkInDate || !guests) {
      return NextResponse.json(
        { error: 'Property ID, check-in date, and number of guests are required' },
        { status: 400 }
      );
    }

    // Get property details
    const property = await Room.findById(propertyId);
    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Check if property is available
    if (!property.availability?.available) {
      return NextResponse.json(
        { error: 'Property is not available for booking' },
        { status: 400 }
      );
    }

    // Check capacity
    if (guests > property.capacity) {
      return NextResponse.json(
        { error: `Property capacity is ${property.capacity} guests` },
        { status: 400 }
      );
    }

    // Calculate total amount (simplified calculation)
    const checkIn = new Date(checkInDate);
    const checkOut = checkOutDate ? new Date(checkOutDate) : null;

    let totalAmount = property.rent; // Base rent
    if (checkOut) {
      const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      totalAmount = (property.rent / 30) * days; // Daily rate approximation
    }

    // Add deposit
    if (property.deposit) {
      totalAmount += property.deposit;
    }

    // Create booking
    const booking = new Booking({
      property: propertyId,
      tenant: userId,
      owner: property.owner.id,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      guests,
      totalAmount,
      status: 'pending',
      paymentStatus: 'pending',
      notes,
      moveInDate: moveInDate ? new Date(moveInDate) : undefined,
      moveOutDate: moveOutDate ? new Date(moveOutDate) : undefined
    });

    await booking.save();

    // Send notification to property owner
    try {
      await sendNotification(
        property.owner.id,
        NotificationTemplates.NEW_BOOKING(property.title, booking._id.toString()),
        userId,
        {
          bookingId: booking._id.toString(),
          propertyId,
          tenantName: user.name,
          checkInDate,
          checkOutDate,
          guests,
          totalAmount
        }
      );
    } catch (notifError) {
      console.error('Error sending booking notification:', notifError);
    }

    // Populate for response
    await booking.populate('property', 'title type images location rent');
    await booking.populate('owner', 'name phone email');

    return NextResponse.json({
      booking: {
        id: booking._id.toString(),
        property: {
          id: booking.property._id.toString(),
          title: booking.property.title,
          type: booking.property.type,
          images: booking.property.images,
          location: booking.property.location,
          rent: booking.property.rent
        },
        owner: {
          id: booking.owner._id.toString(),
          name: booking.owner.name,
          phone: booking.owner.phone,
          email: booking.owner.email
        },
        status: booking.status,
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        guests: booking.guests,
        totalAmount: booking.totalAmount,
        paymentStatus: booking.paymentStatus,
        notes: booking.notes,
        createdAt: booking.createdAt
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
});
