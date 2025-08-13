'use client'
import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Room } from '@/lib/types/room'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import {
  Heart, Share2, MapPin, Star, Users, Calendar,
  Wifi, Car, Shield, Zap, Droplet, Phone, Mail,
  ArrowLeft, ImageIcon, ChevronLeft, ChevronRight
} from 'lucide-react'

export default function RoomDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showImageModal, setShowImageModal] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  const fetchRoom = async () => {
    try {
      setLoading(true)
      // In a real app, you'd have a specific endpoint for individual rooms
      const response = await fetch(`/api/rooms?id=${params.id}`)
      const data = await response.json()

      if (data.rooms && data.rooms.length > 0) {
        setRoom(data.rooms[0])
        setIsFavorite(data.rooms[0].isFavorite)
      }
    } catch (error) {
      console.error('Error fetching room:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (params.id) {
      fetchRoom()
    }
  }, [params.id])

  const toggleFavorite = async () => {
    if (!room) return

    try {
      const response = await fetch('/api/rooms/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          roomId: room.id
        })
      })

      const data = await response.json()
      setIsFavorite(data.isFavorite)
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const shareRoom = async () => {
    if (navigator.share && room) {
      try {
        await navigator.share({
          title: room.title,
          text: `Check out this room: ${room.title}`,
          url: window.location.href,
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const nextImage = () => {
    if (room && room.images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === room.images.length - 1 ? 0 : prev + 1
      )
    }
  }

  const prevImage = () => {
    if (room && room.images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? room.images.length - 1 : prev - 1
      )
    }
  }

  const amenityIcons = {
    WiFi: Wifi,
    AC: Zap,
    Parking: Car,
    Security: Shield,
    'Power Backup': Zap,
    'Water Supply': Droplet
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Room Not Found</h2>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{room.title}</h1>
                <div className="flex items-center space-x-2 mt-1">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">{room.location.area}, {room.location.city}</span>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600 ml-1">{room.rating} ({room.totalReviews} reviews)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={shareRoom}>
                <Share2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFavorite}
                className={isFavorite ? 'text-red-500' : ''}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="relative mb-8">
              <div
                className="relative h-96 bg-gray-200 rounded-lg overflow-hidden cursor-pointer"
                onClick={() => setShowImageModal(true)}
              >
                {room.images.length > 0 ? (
                  <Image
                    src={room.images[currentImageIndex]}
                    alt={room.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ImageIcon className="w-16 h-16 text-gray-400" />
                  </div>
                )}

                {room.images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); prevImage() }}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 rounded-full p-2 hover:bg-white"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); nextImage() }}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 rounded-full p-2 hover:bg-white"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>

                    <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {room.images.length}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnail Strip */}
              {room.images.length > 1 && (
                <div className="flex space-x-2 mt-4 overflow-x-auto">
                  {room.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative h-20 w-20 rounded-lg overflow-hidden flex-shrink-0 ${index === currentImageIndex ? 'ring-2 ring-blue-500' : ''
                        }`}
                    >
                      <Image
                        src={image}
                        alt={`${room.title} ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Room Details */}
            <div className="bg-white rounded-lg p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Room Details</h2>
                <Badge variant="secondary">{room.type.toUpperCase()}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-gray-400" />
                  <span className="text-sm">
                    {room.availability.totalBeds - (room.availability.occupiedBeds || 0)} of {room.availability.totalBeds} beds available
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-sm">
                    Available from {new Date(room.availability.availableFrom).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <p className="text-gray-600 mb-6">{room.description}</p>

              {/* Amenities */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {room.amenities.map((amenity) => {
                    const IconComponent = amenityIcons[amenity as keyof typeof amenityIcons] || Wifi
                    return (
                      <div key={amenity} className="flex items-center space-x-2">
                        <IconComponent className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{amenity}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Rules */}
              {room.rules.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium mb-3">House Rules</h3>
                  <ul className="space-y-1">
                    {room.rules.map((rule, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <span className="w-2 h-2 bg-gray-300 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Location */}
              <div>
                <h3 className="font-medium mb-3">Location</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>{room.location.address}</p>
                  <p>{room.location.area}, {room.location.city}, {room.location.state}</p>
                  <p className="text-blue-600">{room.location.distanceFromCollege} km from college</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="bg-white rounded-lg p-6 sticky top-6">
              {/* Pricing */}
              <div className="mb-6">
                <div className="flex items-baseline space-x-2 mb-2">
                  <span className="text-3xl font-bold">₹{room.pricing.monthlyRent.toLocaleString()}</span>
                  <span className="text-gray-500">/month</span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Security Deposit:</span>
                    <span>₹{room.pricing.securityDeposit.toLocaleString()}</span>
                  </div>
                  {room.pricing.maintenanceCharges && (
                    <div className="flex justify-between">
                      <span>Maintenance:</span>
                      <span>₹{room.pricing.maintenanceCharges.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Electricity:</span>
                    <span className="capitalize">{room.pricing.electricityCharges}</span>
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Preferences</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Gender:</span>
                    <Badge variant="secondary">{room.preferences.gender.toUpperCase()}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Food:</span>
                    <Badge variant="secondary">{room.preferences.foodType.toUpperCase()}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Smoking:</span>
                    <Badge variant={room.preferences.smoking ? "destructive" : "success"}>
                      {room.preferences.smoking ? "Allowed" : "Not Allowed"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Owner Info */}
              <div className="mb-6 pb-6 border-b">
                <h3 className="font-medium mb-3">Owner</h3>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {room.owner.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{room.owner.name}</p>
                    <div className="flex items-center">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="text-xs text-gray-600 ml-1">{room.owner.rating}</span>
                      {room.owner.verified && (
                        <Badge variant="success" className="ml-2 text-xs">Verified</Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <a
                    href={`tel:${room.owner.phone}`}
                    className="flex items-center space-x-2 text-sm text-blue-600 hover:underline"
                  >
                    <Phone className="w-4 h-4" />
                    <span>{room.owner.phone}</span>
                  </a>
                  <a
                    href={`mailto:${room.owner.email}`}
                    className="flex items-center space-x-2 text-sm text-blue-600 hover:underline"
                  >
                    <Mail className="w-4 h-4" />
                    <span>{room.owner.email}</span>
                  </a>
                </div>
              </div>

              {/* Contact Buttons */}
              <div className="space-y-3">
                <Button className="w-full" size="lg">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Owner
                </Button>
                <Button variant="outline" className="w-full" size="lg">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      <Modal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        className="max-w-4xl"
      >
        <div className="relative h-96 bg-gray-900">
          {room.images.length > 0 && (
            <Image
              src={room.images[currentImageIndex]}
              alt={room.title}
              fill
              className="object-contain"
            />
          )}

          {room.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 rounded-full p-2 hover:bg-white"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 rounded-full p-2 hover:bg-white"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </Modal>
    </div>
  )
}
