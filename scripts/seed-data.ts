// scripts/seed-data.ts
import * as dotenv from 'dotenv'
import path from 'path'
import mongoose from 'mongoose'

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

// Import models after env variables are loaded
import Room from '../models/Room'
import User from '../models/User'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('Please define the MONGODB_URI environment variable in .env.local')
  process.exit(1)
}

async function connectDB() {
  if (mongoose.connection.readyState >= 1) {
    return
  }
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined')
  }
  return mongoose.connect(MONGODB_URI)
}

const sampleRooms = [
  {
    title: "Cozy 2BHK near Tech College",
    type: "apartment",
    rent: 15000,
    deposit: 30000,
    location: {
      address: "123 Tech Park Road, Sector 21",
      area: "Tech Park",
      city: "Bangalore",
      state: "Karnataka",
      coordinates: { lat: 12.9716, lng: 77.5946 },
      distanceFromCollege: 0.5
    },
    images: [
      "/images/rooms/room1-1.jpg",
      "/images/rooms/room1-2.jpg",
      "/images/rooms/room1-3.jpg"
    ],
    amenities: ["WiFi", "AC", "Parking", "Security", "Power Backup"],
    description: "A well-maintained 2BHK apartment perfect for students. Located in a safe neighborhood with easy access to college.",
    rules: ["No smoking", "No loud music after 10 PM", "Guests allowed with prior notice"],
    preferences: {
      gender: "any",
      foodType: "both",
      smoking: false
    },
    availability: {
      available: true,
      availableFrom: new Date("2024-01-15"),
      totalBeds: 2,
      occupiedBeds: 0
    },
    owner: {
      id: "507f1f77bcf86cd799439011",
      name: "Rajesh Kumar",
      phone: "+91-9876543210",
      email: "rajesh.kumar@email.com",
      verified: true,
      rating: 4.5
    },
    features: {
      furnished: true,
      ac: true,
      wifi: true,
      parking: true,
      security: true,
      powerBackup: true,
      waterSupply: true
    },
    pricing: {
      monthlyRent: 15000,
      securityDeposit: 30000,
      maintenanceCharges: 2000,
      electricityCharges: "extra"
    },
    reviews: [],
    rating: 4.5,
    totalReviews: 0,
    postedDate: new Date("2024-01-01")
  },
  {
    title: "Single Room in Girls PG",
    type: "pg",
    rent: 8000,
    deposit: 16000,
    location: {
      address: "456 College Street, Near Main Gate",
      area: "College Area",
      city: "Bangalore",
      state: "Karnataka",
      coordinates: { lat: 12.9720, lng: 77.5950 },
      distanceFromCollege: 0.2
    },
    images: [
      "/images/rooms/room2-1.jpg",
      "/images/rooms/room2-2.jpg"
    ],
    amenities: ["WiFi", "Meals", "Laundry", "Security", "Common Room"],
    description: "Safe and secure PG accommodation for female students with homely food and friendly environment.",
    rules: ["Only for girls", "No male visitors", "Be back by 10 PM", "No outside food"],
    preferences: {
      gender: "female",
      foodType: "veg",
      smoking: false
    },
    availability: {
      available: true,
      availableFrom: new Date("2024-02-01"),
      totalBeds: 1,
      occupiedBeds: 0
    },
    owner: {
      id: "507f1f77bcf86cd799439012",
      name: "Priya Sharma",
      phone: "+91-9876543211",
      email: "priya.sharma@email.com",
      verified: true,
      rating: 4.8
    },
    features: {
      furnished: true,
      ac: false,
      wifi: true,
      parking: false,
      security: true,
      powerBackup: true,
      waterSupply: true
    },
    pricing: {
      monthlyRent: 8000,
      securityDeposit: 16000,
      electricityCharges: "included"
    },
    reviews: [],
    rating: 4.8,
    totalReviews: 0,
    postedDate: new Date("2024-01-02")
  },
  {
    title: "Shared Room in Boys Hostel",
    type: "room",
    rent: 6000,
    deposit: 12000,
    location: {
      address: "789 Hostel Complex, University Road",
      area: "University Area",
      city: "Bangalore",
      state: "Karnataka",
      coordinates: { lat: 12.9700, lng: 77.5930 },
      distanceFromCollege: 1.0
    },
    images: [
      "/images/rooms/room3-1.jpg",
      "/images/rooms/room3-2.jpg"
    ],
    amenities: ["WiFi", "Study Hall", "Gym", "Mess", "Common Room"],
    description: "Budget-friendly shared accommodation in a well-maintained hostel with all basic amenities.",
    rules: ["Only for boys", "No loud music", "Maintain cleanliness", "No smoking indoors"],
    preferences: {
      gender: "male",
      foodType: "both",
      smoking: false
    },
    availability: {
      available: true,
      availableFrom: new Date("2024-01-10"),
      totalBeds: 2,
      occupiedBeds: 1
    },
    owner: {
      id: "507f1f77bcf86cd799439013",
      name: "Amit Singh",
      phone: "+91-9876543212",
      email: "amit.singh@email.com",
      verified: true,
      rating: 4.2
    },
    features: {
      furnished: true,
      ac: false,
      wifi: true,
      parking: false,
      security: true,
      powerBackup: false,
      waterSupply: true
    },
    pricing: {
      monthlyRent: 6000,
      securityDeposit: 12000,
      maintenanceCharges: 500,
      electricityCharges: "extra"
    },
    reviews: [],
    rating: 4.2,
    totalReviews: 0,
    postedDate: new Date("2024-01-03")
  },
  {
    title: "Luxury 1BHK with AC",
    type: "apartment",
    rent: 20000,
    deposit: 40000,
    location: {
      address: "321 Premium Heights, IT Corridor",
      area: "IT Corridor",
      city: "Bangalore",
      state: "Karnataka",
      coordinates: { lat: 12.9750, lng: 77.6000 },
      distanceFromCollege: 2.5
    },
    images: [
      "/images/rooms/room4-1.jpg",
      "/images/rooms/room4-2.jpg",
      "/images/rooms/room4-3.jpg",
      "/images/rooms/room4-4.jpg"
    ],
    amenities: ["WiFi", "AC", "Parking", "Security", "Power Backup", "Swimming Pool", "Gym"],
    description: "Premium 1BHK apartment in a gated community with world-class amenities and facilities.",
    rules: ["No pets", "Maintain cleanliness", "Visitor registration required"],
    preferences: {
      gender: "any",
      foodType: "both",
      smoking: false
    },
    availability: {
      available: true,
      availableFrom: new Date("2024-02-15"),
      totalBeds: 1,
      occupiedBeds: 0
    },
    owner: {
      id: "507f1f77bcf86cd799439014",
      name: "Dr. Sunita Reddy",
      phone: "+91-9876543213",
      email: "sunita.reddy@email.com",
      verified: true,
      rating: 4.9
    },
    features: {
      furnished: true,
      ac: true,
      wifi: true,
      parking: true,
      security: true,
      powerBackup: true,
      waterSupply: true
    },
    pricing: {
      monthlyRent: 20000,
      securityDeposit: 40000,
      maintenanceCharges: 3000,
      electricityCharges: "extra"
    },
    reviews: [],
    rating: 4.9,
    totalReviews: 0,
    postedDate: new Date("2024-01-05")
  },
  {
    title: "Budget Triple Sharing Room",
    type: "room",
    rent: 4000,
    deposit: 8000,
    location: {
      address: "567 Budget Inn, Station Road",
      area: "Station Road",
      city: "Bangalore",
      state: "Karnataka",
      coordinates: { lat: 12.9680, lng: 77.5900 },
      distanceFromCollege: 3.0
    },
    images: [
      "/images/rooms/room5-1.jpg",
      "/images/rooms/room5-2.jpg"
    ],
    amenities: ["WiFi", "Common Kitchen", "Laundry", "Study Area"],
    description: "Very affordable triple sharing accommodation for students on a tight budget.",
    rules: ["Only for students", "No loud noise", "Keep common areas clean", "No outside guests"],
    preferences: {
      gender: "male",
      foodType: "veg",
      smoking: false
    },
    availability: {
      available: true,
      availableFrom: new Date("2024-01-20"),
      totalBeds: 3,
      occupiedBeds: 2
    },
    owner: {
      id: "507f1f77bcf86cd799439015",
      name: "Ramesh Gupta",
      phone: "+91-9876543214",
      email: "ramesh.gupta@email.com",
      verified: false,
      rating: 3.8
    },
    features: {
      furnished: true,
      ac: false,
      wifi: true,
      parking: false,
      security: false,
      powerBackup: false,
      waterSupply: true
    },
    pricing: {
      monthlyRent: 4000,
      securityDeposit: 8000,
      electricityCharges: "included"
    },
    reviews: [],
    rating: 3.8,
    totalReviews: 0,
    postedDate: new Date("2024-01-04")
  }
]

const sampleUsers = [
  {
    _id: "507f1f77bcf86cd799439011",
    username: "rajeshkumar",
    name: "Rajesh Kumar",
    email: "rajesh.kumar@email.com",
    phone: "+91-9876543210",
    password: "hashedpassword1",
    userType: "other",
    verified: true,
    favorites: []
  },
  {
    _id: "507f1f77bcf86cd799439012",
    username: "priyasharma",
    name: "Priya Sharma",
    email: "priya.sharma@email.com",
    phone: "+91-9876543211",
    password: "hashedpassword2",
    userType: "other",
    verified: true,
    favorites: []
  },
  {
    _id: "507f1f77bcf86cd799439013",
    username: "amitsingh",
    name: "Amit Singh",
    email: "amit.singh@email.com",
    phone: "+91-9876543212",
    password: "hashedpassword3",
    userType: "other",
    verified: true,
    favorites: []
  },
  {
    _id: "507f1f77bcf86cd799439014",
    username: "sunitareddy",
    name: "Dr. Sunita Reddy",
    email: "sunita.reddy@email.com",
    phone: "+91-9876543213",
    password: "hashedpassword4",
    userType: "faculty",
    collegeRegistrationNo: "FAC001",
    college: "Tech College",
    department: "Computer Science",
    designation: "Professor",
    verified: true,
    favorites: []
  },
  {
    _id: "507f1f77bcf86cd799439015",
    username: "rameshgupta",
    name: "Ramesh Gupta",
    email: "ramesh.gupta@email.com",
    phone: "+91-9876543214",
    password: "hashedpassword5",
    userType: "other",
    verified: false,
    favorites: []
  }
]

export async function seedData() {
  try {
    await connectDB()

    // Clear existing data
    await Room.deleteMany({})
    await User.deleteMany({})

    // Insert users first
    await User.insertMany(sampleUsers)
    console.log('Sample users inserted successfully!')

    // Insert rooms
    await Room.insertMany(sampleRooms)
    console.log('Sample rooms inserted successfully!')

    console.log('Database seeded successfully!')
  } catch (error) {
    console.error('Error seeding database:', error)
  }
}

// Run if called directly
if (require.main === module) {
  seedData().then(() => process.exit(0))
}
