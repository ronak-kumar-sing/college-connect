'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Room, FilterOptions } from '@/lib/types/room'
import { RoomCard } from '@/components/dashboard/RoomCard'
import { FilterPanel } from '@/components/dashboard/FilterPanel'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, SlidersHorizontal, Grid, List } from 'lucide-react'

export default function RoomsPage() {
  const router = useRouter()
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const fetchRooms = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(searchQuery && { search: searchQuery })
      })

      const response = await fetch(`/api/rooms?${params}`)
      const data = await response.json()

      if (page === 1) {
        setRooms(data.rooms)
      } else {
        setRooms(prev => [...prev, ...data.rooms])
      }
      setHasMore(data.pagination.hasMore)
    } catch (error) {
      console.error('Error fetching rooms:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRooms()
  }, [page, searchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchRooms()
  }

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1)
    }
  }

  const handleRoomClick = (room: Room) => {
    router.push(`/rooms/${room.id}`)
  }

  const toggleFavorite = async (roomId: string) => {
    // Implement favorite toggle functionality
    console.log('Toggle favorite for room:', roomId)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Find Rooms</h1>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search by location, amenities, or room type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4"
              />
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-80 flex-shrink-0">
              <FilterPanel
                filters={{
                  priceRange: [1000, 50000],
                  roomType: [],
                  gender: 'any',
                  amenities: [],
                  location: '',
                  availability: '',
                  furnished: null,
                  sortBy: 'newest'
                }}
                onFiltersChange={(filters: FilterOptions) => {
                  console.log('Filters changed:', filters)
                  // Implement filter logic
                }}
              />
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                {rooms.length} rooms found
              </p>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">Sort: Newest First</Badge>
              </div>
            </div>

            {/* Loading State */}
            {loading && page === 1 ? (
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
            ) : (
              <>
                {/* Rooms Grid/List */}
                <div className={
                  viewMode === 'grid'
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-6"
                }>
                  {rooms.map((room) => (
                    <RoomCard
                      key={room.id}
                      room={room}
                      onSelect={() => handleRoomClick(room)}
                      onFavorite={() => toggleFavorite(room.id)}
                    />
                  ))}
                </div>

                {/* Load More Button */}
                {hasMore && (
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
                {rooms.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <div className="max-w-md mx-auto">
                      <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No rooms found
                      </h3>
                      <p className="text-gray-600">
                        Try adjusting your search criteria or filters to find more results.
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
