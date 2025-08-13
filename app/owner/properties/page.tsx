'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import PropertyCard from '@/components/owner/PropertyCard';

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

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchProperties();
  }, [filter]);

  const fetchProperties = async () => {
    try {
      let url = '/api/owner/properties';
      if (filter !== 'all') {
        url += `?status=${filter}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setProperties(data.properties);
      }
    } catch (error) {
      console.error('Failed to fetch properties:', error);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Properties</h1>
          <p className="text-gray-600">Manage your property listings</p>
        </div>
        <Link
          href="/owner/properties/create"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Property
        </Link>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'all'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          All Properties
        </button>
        <button
          onClick={() => setFilter('available')}
          className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'available'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          Available
        </button>
        <button
          onClick={() => setFilter('occupied')}
          className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'occupied'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          Occupied
        </button>
      </div>

      {/* Properties Grid */}
      {properties.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No properties</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding your first property.</p>
          <div className="mt-6">
            <Link
              href="/owner/properties/create"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Property
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
