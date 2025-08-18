// lib/utils/notifications.ts
import Notification from '@/models/Notification';
import connectDB from '@/lib/mongodb';

export interface CreateNotificationParams {
  recipient: string;
  sender?: string;
  type: 'message' | 'booking' | 'property' | 'system' | 'favorite' | 'review';
  title: string;
  message: string;
  data?: any;
  actionUrl?: string;
  priority?: 'low' | 'medium' | 'high';
  expiresAt?: Date;
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    await connectDB();

    const notification = new Notification({
      recipient: params.recipient,
      sender: params.sender || null,
      type: params.type,
      title: params.title,
      message: params.message,
      data: params.data,
      actionUrl: params.actionUrl,
      priority: params.priority || 'medium',
      expiresAt: params.expiresAt
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

export async function createBulkNotifications(notifications: CreateNotificationParams[]) {
  try {
    await connectDB();

    const notificationDocs = notifications.map(params => ({
      recipient: params.recipient,
      sender: params.sender || null,
      type: params.type,
      title: params.title,
      message: params.message,
      data: params.data,
      actionUrl: params.actionUrl,
      priority: params.priority || 'medium',
      expiresAt: params.expiresAt
    }));

    const result = await Notification.insertMany(notificationDocs);
    return result;
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    throw error;
  }
}

// Predefined notification templates
export const NotificationTemplates = {
  NEW_MESSAGE: (senderName: string, conversationId: string) => ({
    type: 'message' as const,
    title: 'New Message',
    message: `${senderName} sent you a message`,
    actionUrl: `/messages/${conversationId}`,
    priority: 'medium' as const
  }),

  NEW_BOOKING: (propertyTitle: string, bookingId: string) => ({
    type: 'booking' as const,
    title: 'New Booking Request',
    message: `Someone is interested in booking your property: ${propertyTitle}`,
    actionUrl: `/owner/bookings/${bookingId}`,
    priority: 'high' as const
  }),

  BOOKING_CONFIRMED: (propertyTitle: string, bookingId: string) => ({
    type: 'booking' as const,
    title: 'Booking Confirmed',
    message: `Your booking for ${propertyTitle} has been confirmed!`,
    actionUrl: `/bookings/${bookingId}`,
    priority: 'high' as const
  }),

  BOOKING_CANCELLED: (propertyTitle: string, bookingId: string) => ({
    type: 'booking' as const,
    title: 'Booking Cancelled',
    message: `Your booking for ${propertyTitle} has been cancelled`,
    actionUrl: `/bookings/${bookingId}`,
    priority: 'medium' as const
  }),

  PROPERTY_APPROVED: (propertyTitle: string, propertyId: string) => ({
    type: 'property' as const,
    title: 'Property Approved',
    message: `Your property "${propertyTitle}" has been approved and is now live!`,
    actionUrl: `/owner/properties/${propertyId}`,
    priority: 'high' as const
  }),

  PROPERTY_REJECTED: (propertyTitle: string, reason: string) => ({
    type: 'property' as const,
    title: 'Property Rejected',
    message: `Your property "${propertyTitle}" was rejected. Reason: ${reason}`,
    priority: 'high' as const
  }),

  NEW_REVIEW: (propertyTitle: string, rating: number, propertyId: string) => ({
    type: 'review' as const,
    title: 'New Review',
    message: `Your property "${propertyTitle}" received a ${rating}-star review`,
    actionUrl: `/owner/properties/${propertyId}`,
    priority: 'low' as const
  }),

  ROOM_FAVORITED: (propertyTitle: string, userName: string, propertyId: string) => ({
    type: 'favorite' as const,
    title: 'Room Favorited',
    message: `${userName} added your property "${propertyTitle}" to their favorites`,
    actionUrl: `/owner/properties/${propertyId}`,
    priority: 'low' as const
  }),

  SYSTEM_MAINTENANCE: (startTime: Date, endTime: Date) => ({
    type: 'system' as const,
    title: 'Scheduled Maintenance',
    message: `System maintenance is scheduled from ${startTime.toLocaleDateString()} to ${endTime.toLocaleDateString()}`,
    priority: 'medium' as const,
    expiresAt: endTime
  }),

  WELCOME_NEW_USER: (userName: string) => ({
    type: 'system' as const,
    title: 'Welcome to CollegeConnect!',
    message: `Welcome ${userName}! Start exploring rooms and PGs near your college.`,
    actionUrl: '/rooms',
    priority: 'low' as const
  })
};

// Helper function to send notification using templates
export async function sendNotification(
  recipient: string,
  template: ReturnType<typeof NotificationTemplates[keyof typeof NotificationTemplates]>,
  sender?: string,
  additionalData?: any
) {
  return await createNotification({
    recipient,
    sender,
    ...template,
    data: additionalData
  });
}
