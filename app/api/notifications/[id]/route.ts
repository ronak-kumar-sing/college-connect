// app/api/notifications/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Notification from '@/models/Notification';
import { withAuth } from '@/lib/middleware/auth';

// Mark notification as read
export const PUT = withAuth(async (request: NextRequest, { userId }) => {
  try {
    await connectDB();

    // Extract the ID from the URL path
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const notificationId = pathSegments[pathSegments.length - 1];

    const body = await request.json();
    const { read } = body;

    // Find and update the notification
    const notification = await Notification.findOneAndUpdate(
      {
        _id: notificationId,
        recipient: userId // Ensure user can only update their own notifications
      },
      { read: read !== undefined ? read : true },
      { new: true }
    ).populate('sender', 'name username');

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      notification: {
        id: notification._id.toString(),
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        read: notification.read,
        actionUrl: notification.actionUrl,
        priority: notification.priority,
        sender: notification.sender ? {
          id: notification.sender._id.toString(),
          name: notification.sender.name,
          username: notification.sender.username
        } : null,
        createdAt: notification.createdAt
      }
    });

  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    );
  }
});

// Delete notification
export const DELETE = withAuth(async (request: NextRequest, { userId }) => {
  try {
    await connectDB();

    // Extract the ID from the URL path
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const notificationId = pathSegments[pathSegments.length - 1];

    // Find and delete the notification
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: userId // Ensure user can only delete their own notifications
    });

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Notification deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
});
