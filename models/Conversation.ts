// models/Conversation.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[];
  type: 'direct' | 'group';
  title?: string; // For group conversations
  description?: string; // For group conversations
  admin?: mongoose.Types.ObjectId; // For group conversations
  lastMessage?: mongoose.Types.ObjectId;
  lastMessageAt: Date;
  metadata?: {
    propertyId?: mongoose.Types.ObjectId; // If conversation is about a property
    bookingId?: mongoose.Types.ObjectId; // If conversation is about a booking
  };
  archived: {
    user: mongoose.Types.ObjectId;
    archivedAt: Date;
  }[];
  blocked: {
    blocker: mongoose.Types.ObjectId;
    blocked: mongoose.Types.ObjectId;
    blockedAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema: Schema = new Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  type: {
    type: String,
    enum: ['direct', 'group'],
    default: 'direct',
    required: true
  },
  title: {
    type: String,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastMessageAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  metadata: {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room'
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    }
  },
  archived: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    archivedAt: {
      type: Date,
      required: true,
      default: Date.now
    }
  }],
  blocked: [{
    blocker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    blocked: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    blockedAt: {
      type: Date,
      required: true,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ lastMessageAt: -1 });
ConversationSchema.index({ 'participants': 1, 'lastMessageAt': -1 });
ConversationSchema.index({ 'metadata.propertyId': 1 });
ConversationSchema.index({ 'metadata.bookingId': 1 });

// Validation: Direct conversations must have exactly 2 participants
ConversationSchema.pre('save', function(this: IConversation, next) {
  if (this.type === 'direct' && this.participants.length !== 2) {
    next(new Error('Direct conversations must have exactly 2 participants'));
  } else if (this.type === 'group' && this.participants.length < 2) {
    next(new Error('Group conversations must have at least 2 participants'));
  } else {
    next();
  }
});

const Conversation = mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', ConversationSchema);
export default Conversation;
