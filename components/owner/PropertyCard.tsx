'use client';

import Link from 'next/link';

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

interface PropertyCardProps {
  property: Property;
  showActions?: boolean;
}

export default function PropertyCard({ property, showActions = true }: PropertyCardProps) {
  const occupancyRate = property.availability.totalBeds > 0
    ? ((property.availability.occupiedBeds / property.availability.totalBeds) * 100).toFixed(0)
    : 0;

  const availableBeds = property.availability.totalBeds - property.availability.occupiedBeds;

  return (
    <div className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow">
      <div className="flex">
        {/* Image */}
        <div className="w-24 h-24 flex-shrink-0 rounded-l-lg overflow-hidden">
          {property.images.length > 0 ? (
            <img
              src={property.images[0]}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-sm">{property.title}</h3>
              <p className="text-sm text-gray-500 capitalize">{property.type}</p>
              <p className="text-sm text-gray-500">{property.location.area}, {property.location.city}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">₹{property.rent.toLocaleString()}</p>
              <p className="text-xs text-gray-500">per month</p>
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
            <span>{availableBeds} beds available</span>
            <span>{occupancyRate}% occupied</span>
            <div className="flex items-center">
              <svg className="w-3 h-3 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <span>{property.rating.toFixed(1)} ({property.totalReviews})</span>
            </div>
          </div>

          {showActions && (
            <div className="mt-3 flex space-x-2">
              <Link
                href={`/owner/properties/edit/${property.id}`}
                className="flex-1 text-center px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
              >
                Edit
              </Link>
              <Link
                href={`/owner/properties/${property.id}`}
                className="flex-1 text-center px-3 py-1 text-xs font-medium text-gray-600 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
              >
                View
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}