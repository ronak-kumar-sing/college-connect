'use client'
import React from 'react'
import { FilterOptions } from '@/lib/types/room'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

interface FilterPanelProps {
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
}

export function FilterPanel({ filters, onFiltersChange }: FilterPanelProps) {
  const roomTypes = [
    { value: 'pg', label: 'PG' },
    { value: 'room', label: 'Room' },
    { value: 'apartment', label: 'Apartment' }
  ]

  const amenitiesList = [
    'WiFi', 'AC', 'Parking', 'Security', 'Power Backup',
    'Water Supply', 'Furnished', 'Laundry', 'Gym'
  ]

  const genderOptions = [
    { value: 'any', label: 'Any' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' }
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

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Filters</h3>
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          Clear All
        </Button>
      </div>

      <div className="space-y-6">
        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium mb-3">
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
        <div>
          <label className="block text-sm font-medium mb-3">Room Type</label>
          <div className="space-y-2">
            {roomTypes.map((type) => (
              <div key={type.value} className="flex items-center space-x-2">
                <Checkbox
                  checked={filters.roomType.includes(type.value)}
                  onChange={() => toggleRoomType(type.value)}
                />
                <label className="text-sm">{type.label}</label>
              </div>
            ))}
          </div>
        </div>

        {/* Gender Preference */}
        <div>
          <label className="block text-sm font-medium mb-3">Gender Preference</label>
          <div className="space-y-2">
            {genderOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="gender"
                  value={option.value}
                  checked={filters.gender === option.value}
                  onChange={(e) => updateFilter('gender', e.target.value)}
                  className="w-4 h-4"
                />
                <label className="text-sm">{option.label}</label>
              </div>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium mb-3">Location</label>
          <Input
            type="text"
            placeholder="Enter area or city"
            value={filters.location}
            onChange={(e) => updateFilter('location', e.target.value)}
          />
        </div>

        {/* Amenities */}
        <div>
          <label className="block text-sm font-medium mb-3">Amenities</label>
          <div className="grid grid-cols-2 gap-2">
            {amenitiesList.map((amenity) => (
              <div key={amenity} className="flex items-center space-x-2">
                <Checkbox
                  checked={filters.amenities.includes(amenity)}
                  onChange={() => toggleAmenity(amenity)}
                />
                <label className="text-xs">{amenity}</label>
              </div>
            ))}
          </div>
        </div>

        {/* Furnished */}
        <div>
          <label className="block text-sm font-medium mb-3">Furnished</label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                name="furnished"
                value="any"
                checked={filters.furnished === null}
                onChange={() => updateFilter('furnished', null)}
                className="w-4 h-4"
              />
              <label className="text-sm">Any</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                name="furnished"
                value="true"
                checked={filters.furnished === true}
                onChange={() => updateFilter('furnished', true)}
                className="w-4 h-4"
              />
              <label className="text-sm">Furnished</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                name="furnished"
                value="false"
                checked={filters.furnished === false}
                onChange={() => updateFilter('furnished', false)}
                className="w-4 h-4"
              />
              <label className="text-sm">Unfurnished</label>
            </div>
          </div>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium mb-3">Sort By</label>
          <select
            value={filters.sortBy}
            onChange={(e) => updateFilter('sortBy', e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="distance">Nearest to College</option>
          </select>
        </div>

        {/* Active Filters */}
        {(filters.roomType.length > 0 || filters.amenities.length > 0) && (
          <div>
            <label className="block text-sm font-medium mb-3">Active Filters</label>
            <div className="flex flex-wrap gap-2">
              {filters.roomType.map((type) => (
                <Badge key={type} variant="secondary" className="text-xs">
                  {type.toUpperCase()}
                  <button
                    onClick={() => toggleRoomType(type)}
                    className="ml-2 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {filters.amenities.map((amenity) => (
                <Badge key={amenity} variant="secondary" className="text-xs">
                  {amenity}
                  <button
                    onClick={() => toggleAmenity(amenity)}
                    className="ml-2 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
