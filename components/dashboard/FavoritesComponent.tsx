'use client'
import React, { useState, useEffect } from 'react'
import { Room } from '@/lib/types/room'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { RoomCard } from './RoomCard'
import {
  Heart,
  Grid,
  List,
  Search,
  Filter,
  SortDesc,
  Trash2,
  Eye
} from 'lucide-react'
import { Input } from '@/components/ui/input'

interface FavoritesComponentProps {
  isOpen: boolean
  onClose: () => void
  onRoomSelect?: (room: Room) => void
}

export function FavoritesComponent({ isOpen, onClose, onRoomSelect }: FavoritesComponentProps) {
  const [favorites, setFavorites] = useState<Room[]>([])
  const [filteredFavorites, setFilteredFavorites] = useState<Room[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'name'>('newest')

  // Utility function to get room ID (handles both id and _id)
  const getRoomId = (room: Room) => room.id || room._id || ''

  const fetchFavorites = async () => {
    try {
      setLoading(true)
      // In a real app, you'd get the user ID from auth context
      const response = await fetch('/api/rooms/favorites?userId=sample-user-id')
      if (response.ok) {
        const data = await response.json()
        console.log('Fetched favorites:', data.favorites)
        // Log the first favorite to see the structure
        if (data.favorites?.length > 0) {
          console.log('First favorite structure:', data.favorites[0])
        }
        setFavorites(data.favorites || [])
        setFilteredFavorites(data.favorites || [])
      } else {
        console.error('Failed to fetch favorites:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error fetching favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeFavorite = async (roomId: string) => {
    try {
      console.log('Removing favorite for roomId:', roomId)
      const response = await fetch('/api/rooms/favorites', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          roomId
        })
      })

      console.log('Delete response status:', response.status)

      if (response.ok) {
        console.log('Successfully removed favorite')
        setFavorites(prev => prev.filter(room => getRoomId(room) !== roomId))
        setFilteredFavorites(prev => prev.filter(room => getRoomId(room) !== roomId))
      } else {
        const errorData = await response.json()
        console.error('Failed to remove favorite:', errorData)
      }
    } catch (error) {
      console.error('Error removing favorite:', error)
    }
  }

  const clearAllFavorites = async () => {
    if (!confirm('Are you sure you want to remove all favorites?')) return

    try {
      const promises = favorites.map(room => removeFavorite(getRoomId(room)))
      await Promise.all(promises)
    } catch (error) {
      console.error('Error clearing all favorites:', error)
    }
  }

  useEffect(() => {
    if (isOpen && favorites.length === 0) {
      fetchFavorites()
    }
  }, [isOpen])

  useEffect(() => {
    let filtered = favorites.filter(room =>
      room.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.description.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Sort favorites
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.pricing.monthlyRent - b.pricing.monthlyRent
        case 'price-high':
          return b.pricing.monthlyRent - a.pricing.monthlyRent
        case 'name':
          return a.title.localeCompare(b.title)
        case 'newest':
        default:
          return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
      }
    })

    setFilteredFavorites(filtered)
  }, [favorites, searchQuery, sortBy])

  const handleRoomClick = (room: Room) => {
    if (onRoomSelect) {
      onRoomSelect(room)
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Favorites" className="max-w-6xl">
      <div className="space-y-6">

        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <Heart className="h-5 w-5 text-red-500" />
            <span className="text-lg font-medium">
              {favorites.length} {favorites.length === 1 ? 'Favorite' : 'Favorites'}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {favorites.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFavorites}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        {favorites.length > 0 && (
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search favorites..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Sort */}
            <div className="flex items-center space-x-2">
              <SortDesc className="h-4 w-4 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>

            {/* View Mode */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-8 w-8 p-0"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8 w-8 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading favorites...</span>
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Favorites Yet</h3>
            <p className="text-gray-500 mb-4">
              Start adding rooms to your favorites by clicking the heart icon on room cards.
            </p>
            <Button onClick={onClose} variant="outline">
              Browse Rooms
            </Button>
          </div>
        ) : filteredFavorites.length === 0 ? (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Found</h3>
            <p className="text-gray-500 mb-4">
              No favorites match your search criteria. Try adjusting your search.
            </p>
            <Button onClick={() => setSearchQuery('')} variant="outline">
              Clear Search
            </Button>
          </div>
        ) : (
          <div className={`
            ${viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
            }
          `}>
            {filteredFavorites.map((room) => (
              <div key={getRoomId(room)} className="relative group">
                <RoomCard
                  room={room}
                  onSelect={() => handleRoomClick(room)}
                  onFavorite={() => removeFavorite(getRoomId(room))}
                />

                {/* Quick Action Buttons */}
                <div className="absolute top-2 right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    onClick={() => handleRoomClick(room)}
                    className="h-8 w-8 p-0 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 shadow-sm"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => removeFavorite(getRoomId(room))}
                    className="h-8 w-8 p-0 bg-white hover:bg-red-50 text-red-600 border border-gray-200 shadow-sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results Count */}
        {filteredFavorites.length > 0 && (
          <div className="text-center text-sm text-gray-500 pt-4 border-t">
            Showing {filteredFavorites.length} of {favorites.length} favorites
          </div>
        )}
      </div>
    </Modal>
  )
}
