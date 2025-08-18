// models/Notification.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId; // User who receives the notification
  sender?: mongoose.Types.ObjectId; // User who triggered the notification (optional for system notifications)
  type: 'message' | 'booking' | 'property' | 'system' | 'favorite' | 'review';
  title: string;
  message: string;
  data?: any; // Additional data for the notification (property ID, booking ID, etc.)
  read: boolean;
  actionUrl?: string; // URL to navigate when notification is clicked
  priority: 'low' | 'medium' | 'high';
  expiresAt?: Date; // For temporary notifications
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // null for system notifications
  },
  type: {
    type: String,
    required: true,
    enum: ['message', 'booking', 'property', 'system', 'favorite', 'review'],
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  data: {
    type: Schema.Types.Mixed, // Flexible data storage
    default: null
  },
  read: {
    type: Boolean,
    default: false,
    index: true
  },
  actionUrl: {
    type: String,
    trim: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  expiresAt: {
    type: Date,
    index: { expireAfterSeconds: 0 } // MongoDB TTL index
  }
}, {
  timestamps: true
});

// Indexes for better query performance
NotificationSchema.index({ recipient: 1, read: 1 });
NotificationSchema.index({ recipient: 1, createdAt: -1 });
NotificationSchema.index({ recipient: 1, type: 1 });
NotificationSchema.index({ createdAt: -1 });

const Notification = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
export default Notification;
