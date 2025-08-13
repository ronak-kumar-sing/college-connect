// components/owner/PropertyForm.tsx
'use client'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ImageUpload } from './ImageUpload'
import { MapPin, Plus, Trash2 } from 'lucide-react'

const propertySchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(100, 'Title too long'),
  description: z.string().min(50, 'Description must be at least 50 characters').max(1000, 'Description too long'),
  type: z.enum(['pg', 'room', 'apartment', '1bhk', '2bhk']),
  location: z.object({
    address: z.string().min(10, 'Address is required'),
    area: z.string().min(2, 'Area is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    pincode: z.string().regex(/^\d{6}$/, 'Invalid pincode'),
    nearbyColleges: z.array(z.string()).optional()
  }),
  roomDetails: z.object({
    totalRooms: z.number().min(1, 'At least 1 room required'),
    totalBeds: z.number().min(1, 'At least 1 bed required'),
    roomTypes: z.array(z.object({
      type: z.string(),
      count: z.number().min(1),
      rent: z.number().min(1)
    })).min(1, 'At least one room type required')
  }),
  pricing: z.object({
    baseRent: z.number().min(500, 'Minimum rent is ₹500'),
    securityDeposit: z.number().min(0),
    maintenanceCharges: z.number().min(0),
    electricityCharges: z.enum(['included', 'extra']),
    foodCharges: z.number().optional(),
  }),
  preferences: z.object({
    gender: z.enum(['male', 'female', 'any']),
    foodType: z.enum(['veg', 'non-veg', 'both']),
    smoking: z.boolean(),
    drinking: z.boolean(),
    pets: z.boolean()
  }),
  contact: z.object({
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid phone number'),
    email: z.string().email('Invalid email'),
    whatsapp: z.string().optional(),
    preferredTime: z.string()
  }),
  availability: z.object({
    available: z.boolean(),
    availableFrom: z.string(),
    minimumStay: z.number().min(1)
  })
})

type PropertyFormData = z.infer<typeof propertySchema>

interface PropertyFormProps {
  onSubmit: (data: PropertyFormData, images: any[]) => void
  initialData?: Partial<PropertyFormData>
  isLoading?: boolean
}

export function PropertyForm({ onSubmit, initialData, isLoading }: PropertyFormProps) {
  const [images, setImages] = useState<any[]>([])
  const [roomTypes, setRoomTypes] = useState([{ type: 'Single', count: 1, rent: 0 }])
  const [amenities, setAmenities] = useState<string[]>([])
  const [rules, setRules] = useState<string[]>([''])
  const [nearbyColleges, setNearbyColleges] = useState<string[]>([''])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: initialData
  })

  const propertyType = watch('type')

  const amenitiesList = [
    'WiFi', 'AC', 'Parking', 'Security', 'Power Backup', 'Water Supply',
    'Laundry', 'Food', 'Gym', 'Lift', 'CCTV', 'Housekeeping',
    'Study Room', 'Recreation Room', 'Balcony', 'Garden'
  ]

  const addRoomType = () => {
    setRoomTypes([...roomTypes, { type: '', count: 1, rent: 0 }])
  }

  const removeRoomType = (index: number) => {
    setRoomTypes(roomTypes.filter((_, i) => i !== index))
  }

  const addRule = () => {
    setRules([...rules, ''])
  }

  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index))
  }

  const addCollege = () => {
    setNearbyColleges([...nearbyColleges, ''])
  }

  const removeCollege = (index: number) => {
    setNearbyColleges(nearbyColleges.filter((_, i) => i !== index))
  }

  const handleFormSubmit = (data: PropertyFormData) => {
    const formattedData = {
      ...data,
      roomDetails: {
        ...data.roomDetails,
        roomTypes: roomTypes.filter(rt => rt.type && rt.count > 0 && rt.rent > 0)
      },
      amenities: amenities,
      rules: rules.filter(rule => rule.trim() !== ''),
      location: {
        ...data.location,
        nearbyColleges: nearbyColleges.filter(college => college.trim() !== '')
      }
    }

    onSubmit(formattedData, images)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* Basic Information */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-6">Basic Information</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Title *
            </label>
            <Input
              {...register('title')}
              placeholder="e.g., Greenleaf PG - Girls Only, Near XYZ College"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Type *
            </label>
            <select
              {...register('type')}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Select type</option>
              <option value="pg">PG (Paying Guest)</option>
              <option value="room">Single Room</option>
              <option value="apartment">Apartment</option>
              <option value="1bhk">1 BHK</option>
              <option value="2bhk">2 BHK</option>
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available From *
            </label>
            <Input
              {...register('availability.availableFrom')}
              type="date"
              className={errors.availability?.availableFrom ? 'border-red-500' : ''}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              {...register('description')}
              rows={4}
              placeholder="Describe your property, its features, nearby facilities, etc."
              className={`w-full p-3 border rounded-md ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          Location Details
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Address *
            </label>
            <textarea
              {...register('location.address')}
              rows={2}
              placeholder="Enter complete address"
              className={`w-full p-3 border rounded-md ${errors.location?.address ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.location?.address && (
              <p className="mt-1 text-sm text-red-600">{errors.location.address.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Area/Locality *
            </label>
            <Input
              {...register('location.area')}
              placeholder="e.g., Koramangala"
              className={errors.location?.area ? 'border-red-500' : ''}
            />
            {errors.location?.area && (
              <p className="mt-1 text-sm text-red-600">{errors.location.area.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City *
            </label>
            <Input
              {...register('location.city')}
              placeholder="e.g., Bangalore"
              className={errors.location?.city ? 'border-red-500' : ''}
            />
            {errors.location?.city && (
              <p className="mt-1 text-sm text-red-600">{errors.location.city.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State *
            </label>
            <Input
              {...register('location.state')}
              placeholder="e.g., Karnataka"
              className={errors.location?.state ? 'border-red-500' : ''}
            />
            {errors.location?.state && (
              <p className="mt-1 text-sm text-red-600">{errors.location.state.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pincode *
            </label>
            <Input
              {...register('location.pincode')}
              placeholder="e.g., 560034"
              className={errors.location?.pincode ? 'border-red-500' : ''}
            />
            {errors.location?.pincode && (
              <p className="mt-1 text-sm text-red-600">{errors.location.pincode.message}</p>
            )}
          </div>

          {/* Nearby Colleges */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nearby Colleges/Universities
            </label>
            {nearbyColleges.map((college, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <Input
                  value={college}
                  onChange={(e) => {
                    const updated = [...nearbyColleges]
                    updated[index] = e.target.value
                    setNearbyColleges(updated)
                  }}
                  placeholder="College/University name"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCollege(index)}
                  disabled={nearbyColleges.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addCollege}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add College
            </Button>
          </div>
        </div>
      </div>

      {/* Room Details */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-6">Room Details</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Rooms *
            </label>
            <Input
              {...register('roomDetails.totalRooms', { valueAsNumber: true })}
              type="number"
              min="1"
              className={errors.roomDetails?.totalRooms ? 'border-red-500' : ''}
            />
            {errors.roomDetails?.totalRooms && (
              <p className="mt-1 text-sm text-red-600">{errors.roomDetails.totalRooms.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Beds *
            </label>
            <Input
              {...register('roomDetails.totalBeds', { valueAsNumber: true })}
              type="number"
              min="1"
              className={errors.roomDetails?.totalBeds ? 'border-red-500' : ''}
            />
            {errors.roomDetails?.totalBeds && (
              <p className="mt-1 text-sm text-red-600">{errors.roomDetails.totalBeds.message}</p>
            )}
          </div>
        </div>

        {/* Room Types */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Room Types & Rent *
          </label>
          {roomTypes.map((roomType, index) => (
            <div key={index} className="grid grid-cols-4 gap-4 mb-4 items-end">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Room Type</label>
                <Input
                  value={roomType.type}
                  onChange={(e) => {
                    const updated = [...roomTypes]
                    updated[index].type = e.target.value
                    setRoomTypes(updated)
                  }}
                  placeholder="e.g., Single, Double"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Count</label>
                <Input
                  type="number"
                  value={roomType.count}
                  onChange={(e) => {
                    const updated = [...roomTypes]
                    updated[index].count = parseInt(e.target.value) || 0
                    setRoomTypes(updated)
                  }}
                  min="1"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Rent (₹/month)</label>
                <Input
                  type="number"
                  value={roomType.rent}
                  onChange={(e) => {
                    const updated = [...roomTypes]
                    updated[index].rent = parseInt(e.target.value) || 0
                    setRoomTypes(updated)
                  }}
                  min="0"
                />
              </div>
              <div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeRoomType(index)}
                  disabled={roomTypes.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addRoomType}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Room Type
          </Button>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-6">Pricing Details</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Base Rent (₹/month) *
            </label>
            <Input
              {...register('pricing.baseRent', { valueAsNumber: true })}
              type="number"
              min="500"
              className={errors.pricing?.baseRent ? 'border-red-500' : ''}
            />
            {errors.pricing?.baseRent && (
              <p className="mt-1 text-sm text-red-600">{errors.pricing.baseRent.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Security Deposit (₹) *
            </label>
            <Input
              {...register('pricing.securityDeposit', { valueAsNumber: true })}
              type="number"
              min="0"
              className={errors.pricing?.securityDeposit ? 'border-red-500' : ''}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maintenance Charges (₹/month)
            </label>
            <Input
              {...register('pricing.maintenanceCharges', { valueAsNumber: true })}
              type="number"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Food Charges (₹/month)
            </label>
            <Input
              {...register('pricing.foodCharges', { valueAsNumber: true })}
              type="number"
              min="0"
              placeholder="Leave empty if not applicable"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Electricity Charges *
            </label>
            <select
              {...register('pricing.electricityCharges')}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="included">Included in rent</option>
              <option value="extra">Extra (as per usage)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Amenities */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-6">Amenities</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {amenitiesList.map((amenity) => (
            <Checkbox
              key={amenity}
              label={amenity}
              checked={amenities.includes(amenity)}
              onChange={(e) => {
                if (e.target.checked) {
                  setAmenities([...amenities, amenity])
                } else {
                  setAmenities(amenities.filter(a => a !== amenity))
                }
              }}
            />
          ))}
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-6">Tenant Preferences</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender Preference *
            </label>
            <select
              {...register('preferences.gender')}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="any">Any</option>
              <option value="male">Male Only</option>
              <option value="female">Female Only</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Food Type *
            </label>
            <select
              {...register('preferences.foodType')}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="both">Both Veg & Non-Veg</option>
              <option value="veg">Vegetarian Only</option>
              <option value="non-veg">Non-Vegetarian Only</option>
            </select>
          </div>

          <div className="md:col-span-2 space-y-3">
            <Checkbox
              {...register('preferences.smoking')}
              label="Smoking allowed"
            />
            <Checkbox
              {...register('preferences.drinking')}
              label="Drinking allowed"
            />
            <Checkbox
              {...register('preferences.pets')}
              label="Pets allowed"
            />
          </div>
        </div>
      </div>

      {/* House Rules */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-6">House Rules</h3>
        {rules.map((rule, index) => (
          <div key={index} className="flex items-center space-x-2 mb-3">
            <Input
              value={rule}
              onChange={(e) => {
                const updated = [...rules]
                updated[index] = e.target.value
                setRules(updated)
              }}
              placeholder="e.g., No visitors after 10 PM"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeRule(index)}
              disabled={rules.length === 1}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addRule}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Rule
        </Button>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-6">Contact Information</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <Input
              {...register('contact.phone')}
              type="tel"
              placeholder="10-digit mobile number"
              className={errors.contact?.phone ? 'border-red-500' : ''}
            />
            {errors.contact?.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.contact.phone.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <Input
              {...register('contact.email')}
              type="email"
              className={errors.contact?.email ? 'border-red-500' : ''}
            />
            {errors.contact?.email && (
              <p className="mt-1 text-sm text-red-600">{errors.contact.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp Number
            </label>
            <Input
              {...register('contact.whatsapp')}
              type="tel"
              placeholder="WhatsApp number (if different)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Contact Time *
            </label>
            <select
              {...register('contact.preferredTime')}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="Anytime">Anytime</option>
              <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
              <option value="Afternoon (12 PM - 6 PM)">Afternoon (12 PM - 6 PM)</option>
              <option value="Evening (6 PM - 9 PM)">Evening (6 PM - 9 PM)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-6">Property Images</h3>
        <ImageUpload
          images={images}
          onImagesChange={setImages}
          maxImages={15}
          maxSize={5}
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline">
          Save as Draft
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700"
        >
          {isLoading ? 'Publishing...' : 'Publish Property'}
        </Button>
      </div>
    </form>
  )
}
