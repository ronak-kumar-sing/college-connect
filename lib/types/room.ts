// lib/types/room.ts
export interface Room {
  id: string;
  title: string;
  type: 'pg' | 'room' | 'apartment';
  rent: number;
  deposit: number;
  location: {
    address: string;
    area: string;
    city: string;
    state: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    distanceFromCollege: number;
  };
  images: string[];
  amenities: string[];
  description: string;
  rules: string[];
  preferences: {
    gender: 'male' | 'female' | 'any';
    foodType: 'veg' | 'non-veg' | 'both';
    smoking: boolean;
  };
  availability: {
    available: boolean;
    availableFrom: string;
    totalBeds: number;
    occupiedBeds: number;
  };
  owner: {
    id: string;
    name: string;
    phone: string;
    email: string;
    avatar?: string;
    verified: boolean;
    rating: number;
  };
  features: {
    furnished: boolean;
    ac: boolean;
    wifi: boolean;
    parking: boolean;
    security: boolean;
    powerBackup: boolean;
    waterSupply: boolean;
  };
  pricing: {
    monthlyRent: number;
    securityDeposit: number;
    maintenanceCharges?: number;
    electricityCharges: 'included' | 'extra';
  };
  reviews: Review[];
  rating: number;
  totalReviews: number;
  isFavorite: boolean;
  postedDate: string;
  lastUpdated: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
}

export interface FilterOptions {
  priceRange: [number, number];
  roomType: string[];
  gender: string;
  amenities: string[];
  location: string;
  availability: string;
  furnished: boolean | null;
  sortBy: 'price-low' | 'price-high' | 'rating' | 'distance' | 'newest';
}
