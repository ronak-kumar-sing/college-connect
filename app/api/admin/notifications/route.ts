// app/api/admin/notifications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Notification from '@/models/Notification';
import { createBulkNotifications, NotificationTemplates } from '@/lib/utils/notifications';

// Admin route to send system notifications
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Check for admin authorization (you should implement proper admin auth)
    const authHeader = request.headers.get('authorization');
    const adminKey = process.env.ADMIN_API_KEY;

    if (!authHeader || !adminKey || authHeader !== `Bearer ${adminKey}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      type, // 'broadcast' | 'targeted' | 'user_type'
      recipients, // Array of user IDs (for targeted)
      userType, // 'student' | 'faculty' | 'other' (for user_type)
      notification: {
        title,
        message,
        actionUrl,
        priority = 'medium',
        expiresAt
      }
    } = body;

    // Validate required fields
    if (!type || !title || !message) {
      return NextResponse.json(
        { error: 'Type, title, and message are required' },
        { status: 400 }
      );
    }

    let targetUsers: string[] = [];

    if (type === 'broadcast') {
      // Send to all users
      const users = await User.find({}, '_id');
      targetUsers = users.map(user => user._id.toString());
    } else if (type === 'targeted' && recipients) {
      // Send to specific users
      targetUsers = recipients;
    } else if (type === 'user_type' && userType) {
      // Send to users of specific type
      const users = await User.find({ userType }, '_id');
      targetUsers = users.map(user => user._id.toString());
    } else {
      return NextResponse.json(
        { error: 'Invalid notification type or missing parameters' },
        { status: 400 }
      );
    }

    if (targetUsers.length === 0) {
      return NextResponse.json(
        { error: 'No target users found' },
        { status: 400 }
      );
    }

    // Create notifications
    const notifications = targetUsers.map(userId => ({
      recipient: userId,
      type: 'system' as const,
      title,
      message,
      actionUrl,
      priority,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined
    }));

    await createBulkNotifications(notifications);

    return NextResponse.json({
      message: `Notification sent to ${targetUsers.length} users`,
      recipientCount: targetUsers.length
    });

  } catch (error) {
    console.error('Error sending system notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}

// Get notification stats (for admin dashboard)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Check for admin authorization
    const authHeader = request.headers.get('authorization');
    const adminKey = process.env.ADMIN_API_KEY;

    if (!authHeader || !adminKey || authHeader !== `Bearer ${adminKey}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get notification statistics
    const stats = await Promise.all([
      // Total notifications sent in the period
      Notification.countDocuments({
        createdAt: { $gte: startDate }
      }),

      // Notifications by type
      Notification.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]),

      // Read vs Unread
      Notification.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: '$read', count: { $sum: 1 } } }
      ]),

      // Notifications by priority
      Notification.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ])
    ]);

    const [totalCount, byType, byReadStatus, byPriority] = stats;

    return NextResponse.json({
      period: `${days} days`,
      totalNotifications: totalCount,
      byType: byType.reduce((acc: any, item: any) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      byReadStatus: byReadStatus.reduce((acc: any, item: any) => {
        acc[item._id ? 'read' : 'unread'] = item.count;
        return acc;
      }, {}),
      byPriority: byPriority.reduce((acc: any, item: any) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    });

  } catch (error) {
    console.error('Error fetching notification stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
