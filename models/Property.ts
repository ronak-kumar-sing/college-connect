// models/Property.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IProperty extends Document {
  title: string;
  description: string;
  type: 'pg' | 'room' | 'apartment' | '1bhk' | '2bhk';
  ownerId: string;
  location: {
    address: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    nearbyColleges: string[];
    distanceFromMainRoad: number;
  };
  images: {
    url: string;
    alt: string;
    isPrimary: boolean;
  }[];
  amenities: string[];
  rules: string[];
  preferences: {
    gender: 'male' | 'female' | 'any';
    foodType: 'veg' | 'non-veg' | 'both';
    smoking: boolean;
    drinking: boolean;
    pets: boolean;
  };
  roomDetails: {
    totalRooms: number;
    totalBeds: number;
    occupiedBeds: number;
    roomTypes: {
      type: string;
      count: number;
      rent: number;
    }[];
  };
  pricing: {
    baseRent: number;
    securityDeposit: number;
    maintenanceCharges: number;
    electricityCharges: 'included' | 'extra';
    foodCharges?: number;
    otherCharges?: {
      name: string;
      amount: number;
    }[];
  };
  features: {
    furnished: boolean;
    ac: boolean;
    wifi: boolean;
    parking: boolean;
    security: boolean;
    powerBackup: boolean;
    waterSupply: boolean;
    laundry: boolean;
    food: boolean;
    gym: boolean;
    lift: boolean;
  };
  contact: {
    phone: string;
    email: string;
    whatsapp?: string;
    preferredTime: string;
  };
  availability: {
    available: boolean;
    availableFrom: Date;
    minimumStay: number; // in months
  };
  verification: {
    verified: boolean;
    verifiedAt?: Date;
    verificationDocuments: string[];
  };
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  stats: {
    views: number;
    inquiries: number;
    bookings: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  type: {
    type: String,
    required: true,
    enum: ['pg', 'room', 'apartment', '1bhk', '2bhk']
  },
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    address: { type: String, required: true },
    area: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    nearbyColleges: [String],
    distanceFromMainRoad: Number
  },
  images: [{
    url: { type: String, required: true },
    alt: String,
    isPrimary: { type: Boolean, default: false }
  }],
  amenities: [String],
  rules: [String],
  preferences: {
    gender: { type: String, enum: ['male', 'female', 'any'], default: 'any' },
    foodType: { type: String, enum: ['veg', 'non-veg', 'both'], default: 'both' },
    smoking: { type: Boolean, default: false },
    drinking: { type: Boolean, default: false },
    pets: { type: Boolean, default: false }
  },
  roomDetails: {
    totalRooms: { type: Number, required: true },
    totalBeds: { type: Number, required: true },
    occupiedBeds: { type: Number, default: 0 },
    roomTypes: [{
      type: String,
      count: Number,
      rent: Number
    }]
  },
  pricing: {
    baseRent: { type: Number, required: true },
    securityDeposit: { type: Number, required: true },
    maintenanceCharges: { type: Number, default: 0 },
    electricityCharges: { type: String, enum: ['included', 'extra'], default: 'extra' },
    foodCharges: Number,
    otherCharges: [{
      name: String,
      amount: Number
    }]
  },
  features: {
    furnished: { type: Boolean, default: false },
    ac: { type: Boolean, default: false },
    wifi: { type: Boolean, default: false },
    parking: { type: Boolean, default: false },
    security: { type: Boolean, default: false },
    powerBackup: { type: Boolean, default: false },
    waterSupply: { type: Boolean, default: false },
    laundry: { type: Boolean, default: false },
    food: { type: Boolean, default: false },
    gym: { type: Boolean, default: false },
    lift: { type: Boolean, default: false }
  },
  contact: {
    phone: { type: String, required: true },
    email: { type: String, required: true },
    whatsapp: String,
    preferredTime: { type: String, default: 'Anytime' }
  },
  availability: {
    available: { type: Boolean, default: true },
    availableFrom: { type: Date, default: Date.now },
    minimumStay: { type: Number, default: 1 }
  },
  verification: {
    verified: { type: Boolean, default: false },
    verifiedAt: Date,
    verificationDocuments: [String]
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'suspended'],
    default: 'active'
  },
  stats: {
    views: { type: Number, default: 0 },
    inquiries: { type: Number, default: 0 },
    bookings: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Index for location-based queries
PropertySchema.index({ 'location.coordinates': '2dsphere' });
PropertySchema.index({ ownerId: 1, status: 1 });

const Property = mongoose.models.Property || mongoose.model<IProperty>('Property', PropertySchema);
export default Property;
