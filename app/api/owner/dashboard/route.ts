import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Room from '@/models/Room';
import Booking from '@/models/Booking';
import { ownerAuth } from '@/lib/middleware/ownerAuth';

export async function GET(request: NextRequest) {
  const authResult = await ownerAuth(request);

  if (!authResult.success) {
    return authResult.response!;
  }

  try {
    await connectDB();

    const ownerId = authResult.userId;

    // Get owner's properties
    const properties = await Room.find({ 'owner.id': ownerId })
      .select('title type rent location images availability rating totalReviews createdAt')
      .sort({ createdAt: -1 });

    // Get owner's bookings
    const bookings = await Booking.find({ owner: ownerId })
      .populate('property', 'title type')
      .populate('tenant', 'name email')
      .sort({ createdAt: -1 });

    // Calculate stats
    const totalProperties = properties.length;
    const occupiedProperties = properties.filter(p => p.availability.occupiedBeds > 0).length;

    const monthlyRevenue = properties.reduce((sum, property) => {
      return sum + (property.rent * property.availability.occupiedBeds);
    }, 0);

    const pendingBookings = bookings.filter(b => b.status === 'pending').length;

    const totalViews = properties.reduce((sum, property) => {
      // This would come from a views tracking system
      return sum + Math.floor(Math.random() * 100) + 50; // Mock data
    }, 0);

    const averageRating = properties.length > 0
      ? properties.reduce((sum, property) => sum + property.rating, 0) / properties.length
      : 0;

    // Recent properties (last 3)
    const recentProperties = properties.slice(0, 3).map(property => ({
      id: property._id.toString(),
      title: property.title,
      type: property.type,
      rent: property.rent,
      location: property.location,
      images: property.images,
      availability: property.availability,
      rating: property.rating,
      totalReviews: property.totalReviews
    }));

    // Recent bookings (last 3)
    const recentBookings = bookings.slice(0, 3).map(booking => ({
      id: booking._id.toString(),
      property: {
        title: booking.property.title,
        type: booking.property.type
      },
      tenant: {
        name: booking.tenant.name,
        email: booking.tenant.email
      },
      status: booking.status,
      startDate: booking.startDate.toISOString(),
      monthlyRent: booking.monthlyRent,
      bookingDate: booking.bookingDate.toISOString()
    }));

    const stats = {
      totalProperties,
      occupiedProperties,
      monthlyRevenue,
      pendingBookings,
      totalViews,
      averageRating: Math.round(averageRating * 10) / 10
    };

    return NextResponse.json({
      success: true,
      stats,
      recentProperties,
      recentBookings
    });

  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
