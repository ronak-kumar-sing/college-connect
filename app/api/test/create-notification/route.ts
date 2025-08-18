// app/api/test/create-notification/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { sendNotification, NotificationTemplates } from '@/lib/utils/notifications';
import { withAuth } from '@/lib/middleware/auth';

// Test endpoint to create sample notifications
export const POST = withAuth(async (request: NextRequest, { userId }) => {
  try {
    await connectDB();

    // Create a sample message notification
    const messageNotification = await sendNotification(
      userId,
      {
        type: 'message' as const,
        title: 'Test Message Notification',
        message: 'This is a test message notification. Click to go to messages!',
        actionUrl: '/messages',
        priority: 'medium' as const
      },
      undefined,
      {
        conversationId: 'test-conversation-id',
        messageId: 'test-message-id'
      }
    );

    // Create a sample booking notification
    const bookingNotification = await sendNotification(
      userId,
      NotificationTemplates.NEW_BOOKING('Test Property', 'test-booking-id'),
      undefined,
      {
        bookingId: 'test-booking-id',
        propertyTitle: 'Test Property'
      }
    );

    // Create a sample system notification
    const systemNotification = await sendNotification(
      userId,
      NotificationTemplates.WELCOME_NEW_USER('Test User'),
      undefined,
      {
        isTest: true
      }
    );

    return NextResponse.json({
      message: 'Test notifications created successfully',
      notifications: [
        {
          id: messageNotification._id.toString(),
          type: 'message',
          title: messageNotification.title
        },
        {
          id: bookingNotification._id.toString(),
          type: 'booking',
          title: bookingNotification.title
        },
        {
          id: systemNotification._id.toString(),
          type: 'system',
          title: systemNotification.title
        }
      ]
    });

  } catch (error) {
    console.error('Error creating test notifications:', error);
    return NextResponse.json(
      { error: 'Failed to create test notifications' },
      { status: 500 }
    );
  }
});
