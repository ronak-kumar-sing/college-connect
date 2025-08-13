// components/dashboard/RoomCard.tsx
'use client'
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Room } from '@/lib/types/room'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Heart,
  MapPin,
  Star,
  Users,
  Wifi,
  Car,
  Shield,
  Zap,
  Droplet
} from 'lucide-react'

interface RoomCardProps {
  room: Room
  onSelect: (room: Room) => void
  onFavorite: (roomId: string) => void
  isSelected?: boolean
}

const amenityIcons = {
  wifi: Wifi,
  parking: Car,
  security: Shield,
  ac: Zap,
  powerBackup: Zap,
  waterSupply: Droplet
}

export function RoomCard({ room, onSelect, onFavorite, isSelected }: RoomCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  // Auto-rotate images on hover every 1.4 seconds as per wireframe
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isHovered && room.images.length > 1) {
      interval = setInterval(() => {
        setCurrentImageIndex(prev =>
          prev === room.images.length - 1 ? 0 : prev + 1
        )
      }, 1400)
    }
    return () => clearInterval(interval)
  }, [isHovered, room.images.length])

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    console.log('RoomCard handleFavoriteClick - room.id:', room.id)
    console.log('RoomCard handleFavoriteClick - room object:', room)
    onFavorite(room.id)
  }

  return (
    <div
      className={`
        bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]
        ${isSelected ? 'ring-2 ring-blue-500' : ''}
      `}
      onClick={() => onSelect(room)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setCurrentImageIndex(0)
      }}
    >
      {/* Image Section */}
      <div className="relative h-48 bg-gray-200">
        {room.images.length > 0 ? (
          <>
            <Image
              src={room.images[currentImageIndex]}
              alt={room.title}
              fill
              className="object-cover transition-opacity duration-300"
            />
            {room.images.length > 1 && (
              <div className="absolute bottom-2 left-2 flex space-x-1">
                {room.images.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <span>No Image</span>
          </div>
        )}

        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleFavoriteClick}
          className={`
            absolute top-2 right-2 p-2 rounded-full shadow-sm
            ${room.isFavorite ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-white/80 hover:bg-white'}
          `}
        >
          <Heart className={`h-4 w-4 ${room.isFavorite ? 'fill-current' : ''}`} />
        </Button>

        {/* Availability Badge */}
        {room.availability.available && (
          <Badge variant="success" className="absolute top-2 left-2">
            Available
          </Badge>
        )}

        {/* Type Badge */}
        <Badge variant="default" className="absolute bottom-2 right-2">
          {room.type.toUpperCase()}
        </Badge>
      </div>

      {/* Content Section */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-900 text-lg truncate">
            {room.title}
          </h3>
          <div className="flex items-center space-x-1 text-sm">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="font-medium">{room.rating}</span>
            <span className="text-gray-500">({room.totalReviews})</span>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center text-gray-600 text-sm mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="truncate">{room.location.area}</span>
          <span className="mx-2">•</span>
          <span>{room.location.distanceFromCollege}km from campus</span>
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-1 mb-3">
          {room.amenities.slice(0, 4).map((amenity, index) => {
            const IconComponent = amenityIcons[amenity.toLowerCase() as keyof typeof amenityIcons]
            return (
              <div key={index} className="flex items-center text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                {IconComponent && <IconComponent className="h-3 w-3 mr-1" />}
                <span>{amenity}</span>
              </div>
            )
          })}
          {room.amenities.length > 4 && (
            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              +{room.amenities.length - 4} more
            </div>
          )}
        </div>

        {/* Occupancy */}
        <div className="flex items-center text-sm text-gray-600 mb-3">
          <Users className="h-4 w-4 mr-1" />
          <span>
            {room.availability.occupiedBeds}/{room.availability.totalBeds} occupied
          </span>
          {room.preferences.gender !== 'any' && (
            <>
              <span className="mx-2">•</span>
              <span className="capitalize">{room.preferences.gender} only</span>
            </>
          )}
        </div>

        {/* Price */}
        <div className="flex justify-between items-center">
          <div>
            <span className="text-2xl font-bold text-green-600">
              ₹{room.pricing.monthlyRent.toLocaleString()}
            </span>
            <span className="text-gray-500 text-sm">/month</span>
            {room.pricing.securityDeposit > 0 && (
              <div className="text-xs text-gray-500">
                + ₹{room.pricing.securityDeposit.toLocaleString()} deposit
              </div>
            )}
          </div>

          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            View Details
          </Button>
        </div>

        {/* Owner Verification */}
        {room.owner.verified && (
          <div className="mt-2 flex items-center text-xs text-green-600">
            <Shield className="h-3 w-3 mr-1" />
            <span>Verified Owner</span>
          </div>
        )}
      </div>
    </div>
  )
}
