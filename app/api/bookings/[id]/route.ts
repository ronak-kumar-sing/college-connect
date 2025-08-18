// app/api/bookings/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Room from '@/models/Room';
import { withAuth } from '@/lib/middleware/auth';
import { sendNotification, NotificationTemplates } from '@/lib/utils/notifications';

// Get booking details
export const GET = withAuth(async (request: NextRequest, { userId }) => {
  try {
    await connectDB();

    // Extract the ID from the URL path
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const bookingId = pathSegments[pathSegments.length - 1];

    const booking = await Booking.findOne({
      _id: bookingId,
      $or: [{ tenant: userId }, { owner: userId }] // User can see booking if they're tenant or owner
    }).populate('property', 'title type images location rent')
      .populate('tenant', 'name phone email')
      .populate('owner', 'name phone email');

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      booking: {
        id: booking._id.toString(),
        property: booking.property ? {
          id: booking.property._id.toString(),
          title: booking.property.title,
          type: booking.property.type,
          images: booking.property.images,
          location: booking.property.location,
          rent: booking.property.rent
        } : null,
        tenant: booking.tenant ? {
          id: booking.tenant._id.toString(),
          name: booking.tenant.name,
          phone: booking.tenant.phone,
          email: booking.tenant.email
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
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt
      }
    });

  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    );
  }
});

// Update booking status
export const PUT = withAuth(async (request: NextRequest, { userId }) => {
  try {
    await connectDB();

    // Extract the ID from the URL path
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const bookingId = pathSegments[pathSegments.length - 1];

    const body = await request.json();
    const { status, paymentStatus, notes } = body;

    // Find booking
    const booking = await Booking.findById(bookingId)
      .populate('property', 'title')
      .populate('tenant', 'name')
      .populate('owner', 'name');

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check permissions - only owner can update booking status, tenant can update payment status
    const isOwner = booking.owner._id.toString() === userId;
    const isTenant = booking.tenant._id.toString() === userId;

    if (!isOwner && !isTenant) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Update fields based on user role
    const updateData: any = {};

    if (status && isOwner) {
      updateData.status = status;

      // Send notification to tenant about status change
      let notificationTemplate;
      if (status === 'confirmed') {
        notificationTemplate = NotificationTemplates.BOOKING_CONFIRMED(
          booking.property.title,
          booking._id.toString()
        );
      } else if (status === 'cancelled') {
        notificationTemplate = NotificationTemplates.BOOKING_CANCELLED(
          booking.property.title,
          booking._id.toString()
        );
      }

      if (notificationTemplate) {
        try {
          await sendNotification(
            booking.tenant._id.toString(),
            notificationTemplate,
            userId,
            {
              bookingId: booking._id.toString(),
              propertyTitle: booking.property.title,
              newStatus: status
            }
          );
        } catch (notifError) {
          console.error('Error sending status update notification:', notifError);
        }
      }
    }

    if (paymentStatus && (isOwner || isTenant)) {
      updateData.paymentStatus = paymentStatus;
    }

    if (notes !== undefined && (isOwner || isTenant)) {
      updateData.notes = notes;
    }

    // Update booking
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      updateData,
      { new: true }
    ).populate('property', 'title type images location rent')
      .populate('tenant', 'name phone email')
      .populate('owner', 'name phone email');

    return NextResponse.json({
      booking: {
        id: updatedBooking!._id.toString(),
        property: updatedBooking!.property ? {
          id: updatedBooking!.property._id.toString(),
          title: updatedBooking!.property.title,
          type: updatedBooking!.property.type,
          images: updatedBooking!.property.images,
          location: updatedBooking!.property.location,
          rent: updatedBooking!.property.rent
        } : null,
        tenant: updatedBooking!.tenant ? {
          id: updatedBooking!.tenant._id.toString(),
          name: updatedBooking!.tenant.name,
          phone: updatedBooking!.tenant.phone,
          email: updatedBooking!.tenant.email
        } : null,
        owner: updatedBooking!.owner ? {
          id: updatedBooking!.owner._id.toString(),
          name: updatedBooking!.owner.name,
          phone: updatedBooking!.owner.phone,
          email: updatedBooking!.owner.email
        } : null,
        status: updatedBooking!.status,
        checkInDate: updatedBooking!.checkInDate,
        checkOutDate: updatedBooking!.checkOutDate,
        guests: updatedBooking!.guests,
        totalAmount: updatedBooking!.totalAmount,
        paymentStatus: updatedBooking!.paymentStatus,
        notes: updatedBooking!.notes,
        updatedAt: updatedBooking!.updatedAt
      }
    });

  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
});

// Cancel/Delete booking
export const DELETE = withAuth(async (request: NextRequest, { userId }) => {
  try {
    await connectDB();

    // Extract the ID from the URL path
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const bookingId = pathSegments[pathSegments.length - 1];

    // Find booking
    const booking = await Booking.findOne({
      _id: bookingId,
      $or: [{ tenant: userId }, { owner: userId }]
    }).populate('property', 'title')
      .populate('tenant', 'name')
      .populate('owner', 'name');

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Only allow cancellation if booking is not confirmed or if it's the owner
    const isOwner = booking.owner._id.toString() === userId;
    const isTenant = booking.tenant._id.toString() === userId;

    if (booking.status === 'confirmed' && isTenant) {
      return NextResponse.json(
        { error: 'Cannot cancel confirmed booking. Contact the owner.' },
        { status: 400 }
      );
    }

    // Update status to cancelled instead of deleting
    booking.status = 'cancelled';
    await booking.save();

    // Send notification to the other party
    const recipientId = isOwner ? booking.tenant._id.toString() : booking.owner._id.toString();

    try {
      await sendNotification(
        recipientId,
        NotificationTemplates.BOOKING_CANCELLED(
          booking.property.title,
          booking._id.toString()
        ),
        userId,
        {
          bookingId: booking._id.toString(),
          propertyTitle: booking.property.title,
          cancelledBy: isOwner ? 'owner' : 'tenant'
        }
      );
    } catch (notifError) {
      console.error('Error sending cancellation notification:', notifError);
    }

    return NextResponse.json({
      message: 'Booking cancelled successfully'
    });

  } catch (error) {
    console.error('Error cancelling booking:', error);
    return NextResponse.json(
      { error: 'Failed to cancel booking' },
      { status: 500 }
    );
  }
});
