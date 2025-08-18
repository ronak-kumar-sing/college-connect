// app/api/notifications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Notification from '@/models/Notification';
import { withAuth } from '@/lib/middleware/auth';

// Get notifications for the authenticated user
export const GET = withAuth(async (request: NextRequest, { userId }) => {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const unreadOnly = searchParams.get('unread') === 'true';
    const type = searchParams.get('type');

    const skip = (page - 1) * limit;

    // Build query
    let query: any = { recipient: userId };

    if (unreadOnly) {
      query.read = false;
    }

    if (type) {
      query.type = type;
    }

    // Get notifications
    const notifications = await Notification.find(query)
      .populate('sender', 'name username')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    // Get total count for pagination
    const total = await Notification.countDocuments(query);

    // Get unread count
    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      read: false
    });

    return NextResponse.json({
      notifications: notifications.map((notification: any) => ({
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
        createdAt: notification.createdAt,
        expiresAt: notification.expiresAt
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: page * limit < total
      },
      unreadCount
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
});

// Create a new notification (typically used by system)
export const POST = withAuth(async (request: NextRequest, { userId }) => {
  try {
    await connectDB();

    const body = await request.json();
    const {
      recipient,
      type,
      title,
      message,
      data,
      actionUrl,
      priority = 'medium',
      expiresAt
    } = body;

    // Validate required fields
    if (!recipient || !type || !title || !message) {
      return NextResponse.json(
        { error: 'Recipient, type, title, and message are required' },
        { status: 400 }
      );
    }

    const notification = new Notification({
      recipient,
      sender: userId,
      type,
      title,
      message,
      data,
      actionUrl,
      priority,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined
    });

    await notification.save();

    // Populate sender for response
    await notification.populate('sender', 'name username');

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
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
});
