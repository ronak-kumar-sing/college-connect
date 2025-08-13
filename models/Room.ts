import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, required: true },
  date: { type: Date, default: Date.now },
  helpful: { type: Number, default: 0 }
})

const roomSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['pg', 'room', 'apartment'], required: true },
  rent: { type: Number, required: true },
  deposit: { type: Number, required: true },

  location: {
    address: { type: String, required: true },
    area: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    distanceFromCollege: { type: Number, required: true }
  },

  images: [{ type: String }],
  amenities: [{ type: String }],
  description: { type: String, required: true },
  rules: [{ type: String }],

  preferences: {
    gender: { type: String, enum: ['male', 'female', 'any'], required: true },
    foodType: { type: String, enum: ['veg', 'non-veg', 'both'], required: true },
    smoking: { type: Boolean, default: false }
  },

  availability: {
    available: { type: Boolean, default: true },
    availableFrom: { type: Date, required: true },
    totalBeds: { type: Number, required: true },
    occupiedBeds: { type: Number, default: 0 }
  },

  owner: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    avatar: { type: String },
    verified: { type: Boolean, default: false },
    rating: { type: Number, min: 0, max: 5, default: 0 }
  },

  features: {
    furnished: { type: Boolean, default: false },
    ac: { type: Boolean, default: false },
    wifi: { type: Boolean, default: false },
    parking: { type: Boolean, default: false },
    security: { type: Boolean, default: false },
    powerBackup: { type: Boolean, default: false },
    waterSupply: { type: Boolean, default: true }
  },

  pricing: {
    monthlyRent: { type: Number, required: true },
    securityDeposit: { type: Number, required: true },
    maintenanceCharges: { type: Number },
    electricityCharges: { type: String, enum: ['included', 'extra'], required: true }
  },

  reviews: [reviewSchema],
  rating: { type: Number, min: 0, max: 5, default: 0 },
  totalReviews: { type: Number, default: 0 },

  postedDate: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now }
}, {
  timestamps: true
})

// Add indexes for better query performance
roomSchema.index({ 'location.city': 1, 'location.area': 1 })
roomSchema.index({ rent: 1 })
roomSchema.index({ type: 1 })
roomSchema.index({ 'availability.available': 1 })
roomSchema.index({ rating: -1 })
roomSchema.index({ postedDate: -1 })

// Virtual field for calculating available beds
roomSchema.virtual('availableBeds').get(function() {
  return (this.availability?.totalBeds || 0) - (this.availability?.occupiedBeds || 0)
})

// Method to add review and update rating
roomSchema.methods.addReview = function(review: any) {
  this.reviews.push(review)
  this.totalReviews = this.reviews.length
  this.rating = this.reviews.reduce((acc: number, rev: any) => acc + rev.rating, 0) / this.reviews.length
  return this.save()
}

const Room = mongoose.models.Room || mongoose.model('Room', roomSchema)

export default Room
