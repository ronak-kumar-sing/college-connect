'use client';

import { useEffect, useState } from 'react';
import StatsCard from '@/components/owner/StatsCard';
import PropertyCard from '@/components/owner/PropertyCard';
import BookingCard from '@/components/owner/BookingCard';

interface DashboardStats {
  totalProperties: number;
  occupiedProperties: number;
  monthlyRevenue: number;
  pendingBookings: number;
  totalViews: number;
  averageRating: number;
}

interface Property {
  id: string;
  title: string;
  type: string;
  rent: number;
  location: {
    area: string;
    city: string;
  };
  images: string[];
  availability: {
    available: boolean;
    totalBeds: number;
    occupiedBeds: number;
  };
  rating: number;
  totalReviews: number;
}

interface Booking {
  id: string;
  property: {
    title: string;
    type: string;
  };
  tenant: {
    name: string;
    email: string;
  };
  status: string;
  startDate: string;
  monthlyRent: number;
  bookingDate: string;
}

export default function OwnerDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentProperties, setRecentProperties] = useState<Property[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/owner/dashboard');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setRecentProperties(data.recentProperties);
        setRecentBookings(data.recentBookings);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const defaultStats: DashboardStats = {
    totalProperties: 0,
    occupiedProperties: 0,
    monthlyRevenue: 0,
    pendingBookings: 0,
    totalViews: 0,
    averageRating: 0
  };

  const currentStats = stats || defaultStats;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome back!</h1>
        <p className="mt-2 text-blue-100">
          Here's what's happening with your properties today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatsCard
          title="Total Properties"
          value={currentStats.totalProperties.toString()}
          icon="building"
          change="+12%"
          changeType="positive"
        />
        <StatsCard
          title="Occupied"
          value={currentStats.occupiedProperties.toString()}
          icon="users"
          change="+5%"
          changeType="positive"
        />
        <StatsCard
          title="Monthly Revenue"
          value={`₹${currentStats.monthlyRevenue.toLocaleString()}`}
          icon="currency"
          change="+8%"
          changeType="positive"
        />
        <StatsCard
          title="Pending Bookings"
          value={currentStats.pendingBookings.toString()}
          icon="calendar"
          change="+3"
          changeType="neutral"
        />
        <StatsCard
          title="Total Views"
          value={currentStats.totalViews.toLocaleString()}
          icon="eye"
          change="+15%"
          changeType="positive"
        />
        <StatsCard
          title="Avg. Rating"
          value={currentStats.averageRating.toFixed(1)}
          icon="star"
          change="+0.2"
          changeType="positive"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Properties */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Properties</h2>
            <a href="/owner/properties" className="text-sm text-blue-600 hover:text-blue-700">
              View all
            </a>
          </div>
          <div className="space-y-4">
            {recentProperties.length > 0 ? (
              recentProperties.slice(0, 3).map((property) => (
                <PropertyCard key={property.id} property={property} showActions={false} />
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No properties found</p>
            )}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
            <a href="/owner/bookings" className="text-sm text-blue-600 hover:text-blue-700">
              View all
            </a>
          </div>
          <div className="space-y-4">
            {recentBookings.length > 0 ? (
              recentBookings.slice(0, 3).map((booking) => (
                <BookingCard key={booking.id} booking={booking} showActions={false} />
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No bookings found</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="/owner/properties/create"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <div className="font-medium">Add Property</div>
              <div className="text-sm text-gray-500">List new property</div>
            </div>
          </a>

          <a
            href="/owner/bookings"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <div className="font-medium">Manage Bookings</div>
              <div className="text-sm text-gray-500">Review requests</div>
            </div>
          </a>

          <a
            href="/owner/analytics"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-6a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <div className="font-medium">View Analytics</div>
              <div className="text-sm text-gray-500">Performance insights</div>
            </div>
          </a>

          <a
            href="/owner/properties"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <div className="font-medium">All Properties</div>
              <div className="text-sm text-gray-500">Manage listings</div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
