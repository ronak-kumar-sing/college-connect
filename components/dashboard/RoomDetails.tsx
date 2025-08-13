// components/dashboard/RoomDetails.tsx
'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import { Room } from '@/lib/types/room'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import {
  MapPin,
  Star,
  Users,
  Heart,
  Phone,
  Mail,
  MessageCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Shield,
  Calendar,
  IndianRupee
} from 'lucide-react'

interface RoomDetailsProps {
  room: Room | null
  onClose: () => void
  onFavorite: (roomId: string) => void
  onContact: (room: Room) => void
}

export function RoomDetails({ room, onClose, onFavorite, onContact }: RoomDetailsProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showContactModal, setShowContactModal] = useState(false)

  if (!room) return null

  const nextImage = () => {
    setCurrentImageIndex(prev =>
      prev === room.images.length - 1 ? 0 : prev + 1
    )
  }

  const prevImage = () => {
    setCurrentImageIndex(prev =>
      prev === 0 ? room.images.length - 1 : prev - 1
    )
  }

  return (
    <>
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl border-l z-40 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Room Details</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4 space-y-6">
          {/* Image Gallery */}
          <div className="relative">
            <div className="relative h-48 bg-gray-200 rounded-lg overflow-hidden">
              {room.images.length > 0 ? (
                <>
                  <Image
                    src={room.images[currentImageIndex]}
                    alt={room.title}
                    fill
                    className="object-cover"
                  />
                  {room.images.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
                        {room.images.map((_, index) => (
                          <div
                            key={index}
                            className={`w-2 h-2 rounded-full cursor-pointer ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                              }`}
                            onClick={() => setCurrentImageIndex(index)}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No Images Available
                </div>
              )}
            </div>
          </div>

          {/* Title and Rating */}
          <div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-bold text-gray-900">{room.title}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onFavorite(room.id)}
                className={room.isFavorite ? 'text-red-500' : 'text-gray-400'}
              >
                <Heart className={`h-5 w-5 ${room.isFavorite ? 'fill-current' : ''}`} />
              </Button>
            </div>
            <div className="flex items-center space-x-2 mb-3">
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                <span className="font-medium">{room.rating}</span>
                <span className="text-gray-500 ml-1">({room.totalReviews} reviews)</span>
              </div>
              <Badge variant={room.type === 'pg' ? 'default' : 'secondary'}>
                {room.type.toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-start text-gray-600">
            <MapPin className="h-4 w-4 mr-2 mt-1 flex-shrink-0" />
            <div>
              <p className="font-medium">{room.location.address}</p>
              <p className="text-sm">{room.location.area}, {room.location.city}</p>
              <p className="text-sm text-blue-600">{room.location.distanceFromCollege}km from campus</p>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold text-green-600">
                ₹{room.pricing.monthlyRent.toLocaleString()}
              </span>
              <span className="text-gray-500">/month</span>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Security Deposit:</span>
                <span>₹{room.pricing.securityDeposit.toLocaleString()}</span>
              </div>
              {room.pricing.maintenanceCharges && (
                <div className="flex justify-between">
                  <span>Maintenance:</span>
                  <span>₹{room.pricing.maintenanceCharges.toLocaleString()}/month</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Electricity:</span>
                <span className="capitalize">{room.pricing.electricityCharges}</span>
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center">
              <Users className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <p className="font-medium">Occupancy</p>
                <p className="text-sm text-gray-600">
                  {room.availability.occupiedBeds}/{room.availability.totalBeds} occupied
                </p>
              </div>
            </div>
            <Badge variant={room.availability.available ? 'success' : 'destructive'}>
              {room.availability.available ? 'Available' : 'Full'}
            </Badge>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-semibold mb-2">Description</h4>
            <p className="text-gray-600 text-sm leading-relaxed">{room.description}</p>
          </div>

          {/* Amenities */}
          <div>
            <h4 className="font-semibold mb-3">Amenities</h4>
            <div className="grid grid-cols-2 gap-2">
              {room.amenities.map((amenity, index) => (
                <div key={index} className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  {amenity}
                </div>
              ))}
            </div>
          </div>

          {/* Preferences */}
          <div>
            <h4 className="font-semibold mb-3">Preferences</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Gender:</span>
                <span className="capitalize font-medium">{room.preferences.gender}</span>
              </div>
              <div className="flex justify-between">
                <span>Food Type:</span>
                <span className="capitalize font-medium">{room.preferences.foodType}</span>
              </div>
              <div className="flex justify-between">
                <span>Smoking:</span>
                <span className="font-medium">{room.preferences.smoking ? 'Allowed' : 'Not Allowed'}</span>
              </div>
            </div>
          </div>

          {/* Rules */}
          {room.rules.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3">House Rules</h4>
              <ul className="space-y-1">
                {room.rules.map((rule, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Owner Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold">Owner Details</h4>
              {room.owner.verified && (
                <div className="flex items-center text-green-600 text-sm">
                  <Shield className="h-4 w-4 mr-1" />
                  Verified
                </div>
              )}
            </div>
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {room.owner.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium">{room.owner.name}</p>
                <div className="flex items-center text-sm text-gray-600">
                  <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                  <span>{room.owner.rating}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Buttons */}
          <div className="space-y-2">
            <Button
              onClick={() => setShowContactModal(true)}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Contact Owner
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm">
                <Phone className="h-4 w-4 mr-2" />
                Call
              </Button>
              <Button variant="outline" size="sm">
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
            </div>
          </div>

          {/* Posted Date */}
          <div className="text-xs text-gray-500 text-center border-t pt-4">
            Posted on {new Date(room.postedDate).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      <Modal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        title="Contact Owner"
        className="max-w-md"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium">
                {room.owner.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-medium">{room.owner.name}</p>
              <p className="text-sm text-gray-600">Property Owner</p>
            </div>
          </div>

          <div className="space-y-3">
            <Button className="w-full" onClick={() => onContact(room)}>
              <MessageCircle className="h-4 w-4 mr-2" />
              Send Message
            </Button>
            <Button variant="outline" className="w-full">
              <Phone className="h-4 w-4 mr-2" />
              {room.owner.phone}
            </Button>
            <Button variant="outline" className="w-full">
              <Mail className="h-4 w-4 mr-2" />
              {room.owner.email}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
