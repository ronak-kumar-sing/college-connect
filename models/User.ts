// models/User.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  username: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  userType: 'student' | 'faculty' | 'other';
  collegeRegistrationNo?: string; // Only for students and faculty
  college?: string;
  department?: string;
  year?: number; // Only for students
  designation?: string; // Only for faculty
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minlength: 3,
    maxlength: 30
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  userType: {
    type: String,
    required: true,
    enum: ['student', 'faculty', 'other']
  },
  collegeRegistrationNo: {
    type: String,
    sparse: true, // Allows null values while maintaining uniqueness for non-null values
    trim: true,
    uppercase: true
  },
  college: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    trim: true
  },
  year: {
    type: Number,
    min: 1,
    max: 5
  },
  designation: {
    type: String,
    trim: true
  },
  verified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Validation: College Registration No is required for students and faculty
UserSchema.pre('save', function(next) {
  if ((this.userType === 'student' || this.userType === 'faculty') && !this.collegeRegistrationNo) {
    next(new Error('College Registration Number is required for students and faculty'));
  } else {
    next();
  }
});

const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
