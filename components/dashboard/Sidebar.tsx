// components/dashboard/Sidebar.tsx
'use client'
import React from 'react'
import { FilterOptions } from '@/lib/types/room'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { X, MapPin, Star, Wifi, Car, Shield } from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
}

const amenitiesIcons = {
  wifi: Wifi,
  parking: Car,
  security: Shield,
}

export function Sidebar({ isOpen, onClose, filters, onFiltersChange }: SidebarProps) {
  const updateFilters = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const amenitiesList = ['WiFi', 'Parking', 'Security', 'AC', 'Power Backup', 'Water Supply', 'Laundry', 'Food', 'Gym']
  const roomTypes = ['PG', 'Single Room', 'Shared Room', 'Apartment', '1BHK', '2BHK']
  const locations = ['Near Main Campus', 'City Center', 'IT Park Area', 'Medical College', 'Engineering Campus']

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-80 bg-white border-r transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:block overflow-y-auto
      `}>
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="lg:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="space-y-6">
            {/* Price Range */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Price Range</h3>
              <div className="space-y-3">
                <Slider
                  value={filters.priceRange}
                  onValueChange={(value) => updateFilters('priceRange', value)}
                  max={50000}
                  min={1000}
                  step={1000}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>₹{filters.priceRange[0].toLocaleString()}</span>
                  <span>₹{filters.priceRange[1].toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Room Type */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Room Type</h3>
              <div className="space-y-2">
                {roomTypes.map(type => (
                  <Checkbox
                    key={type}
                    label={type}
                    checked={filters.roomType.includes(type)}
                    onChange={(e) => {
                      const checked = e.target.checked
                      const updatedTypes = checked
                        ? [...filters.roomType, type]
                        : filters.roomType.filter(t => t !== type)
                      updateFilters('roomType', updatedTypes)
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Gender Preference */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Gender Preference</h3>
              <div className="space-y-2">
                {['Any', 'Male', 'Female'].map(gender => (
                  <label key={gender} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="gender"
                      value={gender.toLowerCase()}
                      checked={filters.gender === gender.toLowerCase()}
                      onChange={(e) => updateFilters('gender', e.target.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{gender}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">
                <MapPin className="inline h-4 w-4 mr-1" />
                Location
              </h3>
              <div className="space-y-2">
                {locations.map(location => (
                  <label key={location} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="location"
                      value={location}
                      checked={filters.location === location}
                      onChange={(e) => updateFilters('location', e.target.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{location}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Amenities</h3>
              <div className="space-y-2">
                {amenitiesList.map(amenity => (
                  <Checkbox
                    key={amenity}
                    label={amenity}
                    checked={filters.amenities.includes(amenity)}
                    onChange={(e) => {
                      const checked = e.target.checked
                      const updatedAmenities = checked
                        ? [...filters.amenities, amenity]
                        : filters.amenities.filter(a => a !== amenity)
                      updateFilters('amenities', updatedAmenities)
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Availability */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Availability</h3>
              <div className="space-y-2">
                {['Available Now', 'Available This Month', 'Available Next Month'].map(option => (
                  <label key={option} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="availability"
                      value={option}
                      checked={filters.availability === option}
                      onChange={(e) => updateFilters('availability', e.target.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Furnished */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Furnishing</h3>
              <div className="space-y-2">
                {[
                  { value: true, label: 'Furnished' },
                  { value: false, label: 'Unfurnished' },
                  { value: null, label: 'Any' }
                ].map(option => (
                  <label key={option.label} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="furnished"
                      checked={filters.furnished === option.value}
                      onChange={() => updateFilters('furnished', option.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sort By */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Sort By</h3>
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilters('sortBy', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="distance">Distance</option>
              </select>
            </div>

            {/* Clear Filters */}
            <Button
              variant="outline"
              onClick={() => onFiltersChange({
                priceRange: [1000, 50000],
                roomType: [],
                gender: 'any',
                amenities: [],
                location: '',
                availability: '',
                furnished: null,
                sortBy: 'newest'
              })}
              className="w-full"
            >
              Clear All Filters
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
