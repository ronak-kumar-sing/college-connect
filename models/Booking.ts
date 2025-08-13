import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  property: mongoose.Types.ObjectId;
  tenant: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  monthlyRent: number;
  securityDeposit: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'rejected' | 'active' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded';
  bookingDate: Date;
  moveInDate?: Date;
  moveOutDate?: Date;
  notes?: string;
  documents: string[];
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema: Schema = new Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  monthlyRent: {
    type: Number,
    required: true
  },
  securityDeposit: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'paid', 'refunded'],
    default: 'pending'
  },
  bookingDate: {
    type: Date,
    default: Date.now
  },
  moveInDate: {
    type: Date
  },
  moveOutDate: {
    type: Date
  },
  notes: {
    type: String
  },
  documents: [{
    type: String
  }]
}, {
  timestamps: true
});

// Indexes
BookingSchema.index({ property: 1, status: 1 });
BookingSchema.index({ tenant: 1, status: 1 });
BookingSchema.index({ owner: 1, status: 1 });
BookingSchema.index({ bookingDate: -1 });

const Booking = mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);
export default Booking;
