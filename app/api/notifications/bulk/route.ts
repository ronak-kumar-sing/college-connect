// app/api/notifications/bulk/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Notification from '@/models/Notification';
import { withAuth } from '@/lib/middleware/auth';

// Bulk actions on notifications
export const POST = withAuth(async (request: NextRequest, { userId }) => {
  try {
    await connectDB();

    const body = await request.json();
    const { action, notificationIds, markAllAsRead, type } = body;

    if (action === 'mark_as_read') {
      let query: any = { recipient: userId };

      if (markAllAsRead) {
        // Mark all unread notifications as read
        query.read = false;
        if (type) {
          query.type = type;
        }
      } else if (notificationIds && notificationIds.length > 0) {
        // Mark specific notifications as read
        query._id = { $in: notificationIds };
      } else {
        return NextResponse.json(
          { error: 'Either markAllAsRead or notificationIds is required' },
          { status: 400 }
        );
      }

      const result = await Notification.updateMany(query, { read: true });

      return NextResponse.json({
        message: `${result.modifiedCount} notifications marked as read`,
        modifiedCount: result.modifiedCount
      });

    } else if (action === 'delete') {
      if (!notificationIds || notificationIds.length === 0) {
        return NextResponse.json(
          { error: 'notificationIds is required for delete action' },
          { status: 400 }
        );
      }

      const result = await Notification.deleteMany({
        _id: { $in: notificationIds },
        recipient: userId // Ensure user can only delete their own notifications
      });

      return NextResponse.json({
        message: `${result.deletedCount} notifications deleted`,
        deletedCount: result.deletedCount
      });

    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "mark_as_read" or "delete"' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error performing bulk action on notifications:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk action' },
      { status: 500 }
    );
  }
});
