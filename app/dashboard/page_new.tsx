// app/dashboard/page.tsx
'use client'
import React, { useState, useEffect } from 'react'
import { RoomCard } from '@/components/dashboard/RoomCard'
import { RoomDetails } from '@/components/dashboard/RoomDetails'
import { Room, FilterOptions } from '@/lib/types/room'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Grid, List, Map } from 'lucide-react'

interface DashboardPageProps {
  filters?: FilterOptions
  searchQuery?: string
  onFiltersChange?: (filters: FilterOptions) => void
  onSearchChange?: (query: string) => void
}

export default function DashboardPage({
  filters,
  searchQuery,
  onFiltersChange,
  onSearchChange
}: DashboardPageProps) {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid')
  const [rooms, setRooms] = useState<Room[]>([])
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  // Fetch rooms from API
  const fetchRooms = async (reset = false) => {
    try {
      setLoading(true)
      const currentPage = reset ? 1 : page
      const response = await fetch(`/api/rooms?page=${currentPage}&limit=12`)
      const data = await response.json()

      if (reset || currentPage === 1) {
        setRooms(data.rooms || [])
      } else {
        setRooms(prev => [...prev, ...(data.rooms || [])])
      }
      setHasMore(data.pagination?.hasMore || false)

      if (reset) {
        setPage(2) // Next page will be 2
      }
    } catch (error) {
      console.error('Error fetching rooms:', error)
    } finally {
      setLoading(false)
    }
  }

  // Apply filters and search
  useEffect(() => {
    if (!rooms.length) return

    let filtered = [...rooms]

    // Apply search filter
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(room =>
        room.title.toLowerCase().includes(query) ||
        room.description.toLowerCase().includes(query) ||
        room.location.address.toLowerCase().includes(query) ||
        room.location.area.toLowerCase().includes(query)
      )
    }

    // Apply filters
    if (filters) {
      // Price range filter
      filtered = filtered.filter(room =>
        room.pricing.monthlyRent >= filters.priceRange[0] &&
        room.pricing.monthlyRent <= filters.priceRange[1]
      )

      // Room type filter
      if (filters.roomType.length > 0) {
        filtered = filtered.filter(room =>
          filters.roomType.includes(room.type)
        )
      }

      // Gender preference filter
      if (filters.gender !== 'any') {
        filtered = filtered.filter(room =>
          room.preferences.gender === 'any' || room.preferences.gender === filters.gender
        )
      }

      // Amenities filter
      if (filters.amenities.length > 0) {
        filtered = filtered.filter(room =>
          filters.amenities.every(amenity =>
            room.amenities.some(roomAmenity =>
              roomAmenity.toLowerCase().includes(amenity.toLowerCase())
            )
          )
        )
      }

      // Location filter
      if (filters.location) {
        filtered = filtered.filter(room =>
          room.location.area.toLowerCase().includes(filters.location.toLowerCase()) ||
          room.location.address.toLowerCase().includes(filters.location.toLowerCase())
        )
      }

      // Furnished filter
      if (filters.furnished !== null) {
        filtered = filtered.filter(room =>
          room.features.furnished === filters.furnished
        )
      }

      // Availability filter
      if (filters.availability) {
        const now = new Date()
        filtered = filtered.filter(room => {
          if (!room.availability.available) return false

          const availableFrom = new Date(room.availability.availableFrom)

          switch (filters.availability) {
            case 'immediate':
              return availableFrom <= now
            case 'within-week':
              return availableFrom <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
            case 'within-month':
              return availableFrom <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
            default:
              return true
          }
        })
      }

      // Sort results
      filtered.sort((a, b) => {
        switch (filters.sortBy) {
          case 'price-low':
            return a.pricing.monthlyRent - b.pricing.monthlyRent
          case 'price-high':
            return b.pricing.monthlyRent - a.pricing.monthlyRent
          case 'rating':
            return b.rating - a.rating
          case 'distance':
            return a.location.distanceFromCollege - b.location.distanceFromCollege
          case 'newest':
          default:
            return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
        }
      })
    }

    setFilteredRooms(filtered)
  }, [rooms, filters, searchQuery])

  useEffect(() => {
    fetchRooms(true) // Reset and fetch fresh data
  }, [])

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1)
    }
  }

  const handleRoomSelect = (room: Room) => {
    setSelectedRoom(room)
  }

  const handleContact = (room: Room) => {
    // Handle contact functionality
    console.log('Contact owner for room:', room.id)
  }

  const handleFavorite = async (roomId: string) => {
    // Implement favorite toggle
    try {
      const response = await fetch('/api/rooms/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'sample-user-id', // In a real app, get from auth context
          roomId
        })
      })

      if (response.ok) {
        // Update room favorite status locally
        setRooms(prev =>
          prev.map(room =>
            room.id === roomId
              ? { ...room, isFavorite: !room.isFavorite }
              : room
          )
        )
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const handleViewModeChange = (mode: 'grid' | 'list' | 'map') => {
    setViewMode(mode)
  }

  if (loading && filteredRooms.length === 0) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-4 animate-pulse"
            >
              <div className="bg-gray-200 h-48 rounded-md mb-4"></div>
              <div className="space-y-2">
                <div className="bg-gray-200 h-4 rounded"></div>
                <div className="bg-gray-200 h-4 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">
              {filteredRooms.length} rooms available
              {filteredRooms.length !== rooms.length && (
                <span className="text-sm text-blue-600 ml-1">
                  (filtered from {rooms.length} total)
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleViewModeChange('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleViewModeChange('list')}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'map' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleViewModeChange('map')}
            >
              <Map className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Room Grid/List */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onSelect={handleRoomSelect}
                onFavorite={handleFavorite}
                isSelected={selectedRoom?.id === room.id}
              />
            ))}
          </div>
        )}

        {viewMode === 'list' && (
          <div className="space-y-4">
            {filteredRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onSelect={handleRoomSelect}
                onFavorite={handleFavorite}
                isSelected={selectedRoom?.id === room.id}
              />
            ))}
          </div>
        )}

        {viewMode === 'map' && (
          <div className="bg-white rounded-lg p-8 text-center">
            <Map className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Map View
            </h3>
            <p className="text-gray-600">
              Map integration coming soon. This will show rooms on an interactive map.
            </p>
          </div>
        )}

        {/* Load More Button */}
        {hasMore && viewMode !== 'map' && (
          <div className="text-center mt-8">
            <Button
              onClick={loadMore}
              disabled={loading}
              size="lg"
            >
              {loading ? 'Loading...' : 'Load More Rooms'}
            </Button>
          </div>
        )}

        {/* No Results */}
        {filteredRooms.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Grid className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No rooms found
              </h3>
              <p className="text-gray-600">
                {rooms.length === 0
                  ? "No rooms available at the moment."
                  : "Try adjusting your search criteria or filters to find more results."
                }
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Room Details Sidebar */}
      {selectedRoom && (
        <div className="w-96 border-l bg-white">
          <RoomDetails
            room={selectedRoom}
            onClose={() => setSelectedRoom(null)}
            onFavorite={() => handleFavorite(selectedRoom.id)}
            onContact={() => handleContact(selectedRoom)}
          />
        </div>
      )}
    </div>
  )
}
