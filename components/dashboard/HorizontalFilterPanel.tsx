'use client'
import React, { useState } from 'react'
import { FilterOptions } from '@/lib/types/room'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronUp, Filter, X, MapPin, Home, Users, Wifi, Car, Shield, Star } from 'lucide-react'

interface HorizontalFilterPanelProps {
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
}

export function HorizontalFilterPanel({ filters, onFiltersChange }: HorizontalFilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const roomTypes = [
    { value: 'pg', label: 'PG' },
    { value: 'single', label: 'Single Room' },
    { value: 'shared', label: 'Shared Room' },
    { value: 'apartment', label: 'Apartment' },
    { value: '1bhk', label: '1BHK' },
    { value: '2bhk', label: '2BHK' }
  ]

  const amenitiesList = [
    'WiFi', 'AC', 'Parking', 'Security', 'Power Backup',
    'Water Supply', 'Furnished', 'Laundry', 'Gym', 'Food'
  ]

  const genderOptions = [
    { value: 'any', label: 'Any' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' }
  ]

  const locations = [
    'Near Main Campus', 'City Center', 'IT Park Area',
    'Medical College', 'Engineering Campus', 'Law College'
  ]

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const toggleRoomType = (type: string) => {
    const currentTypes = filters.roomType
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type]
    updateFilter('roomType', newTypes)
  }

  const toggleAmenity = (amenity: string) => {
    const currentAmenities = filters.amenities
    const newAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter(a => a !== amenity)
      : [...currentAmenities, amenity]
    updateFilter('amenities', newAmenities)
  }

  const clearFilters = () => {
    onFiltersChange({
      priceRange: [1000, 50000],
      roomType: [],
      gender: 'any',
      amenities: [],
      location: '',
      availability: '',
      furnished: null,
      sortBy: 'newest'
    })
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.roomType.length > 0) count++
    if (filters.amenities.length > 0) count++
    if (filters.gender !== 'any') count++
    if (filters.location) count++
    if (filters.priceRange[0] !== 1000 || filters.priceRange[1] !== 50000) count++
    if (filters.furnished !== null) count++
    return count
  }

  return (
    <div className="bg-white border-b shadow-sm">
      {/* Quick Filters Bar */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {getActiveFiltersCount() > 0 && (
              <Badge variant="default" className="h-5 w-5 p-0 text-xs">
                {getActiveFiltersCount()}
              </Badge>
            )}
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>

          {/* Quick Filter Chips */}
          <div className="flex items-center space-x-2 flex-wrap">
            {roomTypes.slice(0, 3).map((type) => (
              <Button
                key={type.value}
                variant={filters.roomType.includes(type.value) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleRoomType(type.value)}
                className="h-8"
              >
                {type.label}
              </Button>
            ))}
          </div>

          {/* Price Range Quick Display */}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>₹{filters.priceRange[0].toLocaleString()} - ₹{filters.priceRange[1].toLocaleString()}</span>
          </div>
        </div>

        {/* Clear Filters */}
        {getActiveFiltersCount() > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear All
          </Button>
        )}
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4">

            {/* Price Range */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Price Range: ₹{filters.priceRange[0].toLocaleString()} - ₹{filters.priceRange[1].toLocaleString()}
              </label>
              <Slider
                value={filters.priceRange}
                onValueChange={(value) => updateFilter('priceRange', value)}
                max={50000}
                min={1000}
                step={1000}
                className="w-full"
              />
            </div>

            {/* Room Type */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Room Type</label>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {roomTypes.map((type) => (
                  <div key={type.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`room-${type.value}`}
                      checked={filters.roomType.includes(type.value)}
                      onChange={() => toggleRoomType(type.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor={`room-${type.value}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {type.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Gender Preference */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Gender Preference</label>
              <div className="space-y-1">
                {genderOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={`gender-${option.value}`}
                      name="gender"
                      checked={filters.gender === option.value}
                      onChange={() => updateFilter('gender', option.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label
                      htmlFor={`gender-${option.value}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Location</label>
              <select
                value={filters.location}
                onChange={(e) => updateFilter('location', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">Any Location</option>
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Amenities Section */}
          <div className="mt-4 pt-4 border-t">
            <label className="block text-sm font-medium mb-2">Amenities</label>
            <div className="flex flex-wrap gap-2">
              {amenitiesList.map((amenity) => (
                <Button
                  key={amenity}
                  variant={filters.amenities.includes(amenity) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleAmenity(amenity)}
                  className="h-8"
                >
                  {amenity}
                </Button>
              ))}
            </div>
          </div>

          {/* Additional Filters */}
          <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Furnished */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Furnished</label>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="furnished-any"
                    name="furnished"
                    checked={filters.furnished === null}
                    onChange={() => updateFilter('furnished', null)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="furnished-any" className="text-sm font-normal cursor-pointer">
                    Any
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="furnished-yes"
                    name="furnished"
                    checked={filters.furnished === true}
                    onChange={() => updateFilter('furnished', true)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="furnished-yes" className="text-sm font-normal cursor-pointer">
                    Furnished
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="furnished-no"
                    name="furnished"
                    checked={filters.furnished === false}
                    onChange={() => updateFilter('furnished', false)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="furnished-no" className="text-sm font-normal cursor-pointer">
                    Unfurnished
                  </label>
                </div>
              </div>
            </div>

            {/* Availability */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Availability</label>
              <select
                value={filters.availability}
                onChange={(e) => updateFilter('availability', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">Any Time</option>
                <option value="immediate">Immediate</option>
                <option value="within-week">Within a Week</option>
                <option value="within-month">Within a Month</option>
              </select>
            </div>

            {/* Sort By */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilter('sortBy', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="distance">Distance</option>
              </select>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
