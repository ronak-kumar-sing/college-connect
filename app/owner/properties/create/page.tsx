'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SimpleImageUploadProps {
  onImagesChange: (images: string[]) => void;
}

function SimpleImageUpload({ onImagesChange }: SimpleImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    const formData = new FormData();

    files.forEach(file => {
      formData.append('images', file);
    });

    try {
      const response = await fetch('/api/owner/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        onImagesChange(result.files);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
      <div className="text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="mt-4">
          <label htmlFor="file-upload" className="cursor-pointer">
            <span className="mt-2 block text-sm font-medium text-gray-900">
              {uploading ? 'Uploading...' : 'Upload property images'}
            </span>
            <input
              id="file-upload"
              name="file-upload"
              type="file"
              multiple
              accept="image/*"
              className="sr-only"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
          <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 5MB each</p>
        </div>
      </div>
    </div>
  );
}

export default function CreatePropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    type: 'pg',
    rent: '',
    deposit: '',
    description: '',
    location: {
      address: '',
      area: '',
      city: '',
      state: '',
      coordinates: { lat: 0, lng: 0 },
      distanceFromCollege: ''
    },
    availability: {
      available: true,
      availableFrom: '',
      totalBeds: '',
      occupiedBeds: 0
    },
    preferences: {
      gender: 'any',
      foodType: 'both',
      smoking: false
    },
    features: {
      furnished: false,
      ac: false,
      wifi: false,
      parking: false,
      security: false,
      powerBackup: false,
      waterSupply: true
    },
    amenities: [] as string[],
    rules: [] as string[]
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => {
        const parentObj = prev[parent as keyof typeof prev] as any;
        return {
          ...prev,
          [parent]: {
            ...parentObj,
            [child]: type === 'checkbox' ? checked : value
          }
        };
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleArrayChange = (field: 'amenities' | 'rules', value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
    }
  };

  const removeFromArray = (field: 'amenities' | 'rules', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const propertyData = {
        ...formData,
        rent: parseInt(formData.rent),
        deposit: parseInt(formData.deposit),
        location: {
          ...formData.location,
          distanceFromCollege: parseInt(formData.location.distanceFromCollege)
        },
        availability: {
          ...formData.availability,
          totalBeds: parseInt(formData.availability.totalBeds),
          availableFrom: new Date(formData.availability.availableFrom)
        },
        images,
        pricing: {
          monthlyRent: parseInt(formData.rent),
          securityDeposit: parseInt(formData.deposit),
          electricityCharges: 'extra'
        }
      };

      const response = await fetch('/api/owner/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(propertyData),
      });

      if (response.ok) {
        router.push('/owner/properties');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create property');
      }
    } catch (error) {
      console.error('Error creating property:', error);
      alert('Failed to create property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add New Property</h1>
        <p className="text-gray-600">Fill in the details to list your property</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="pg">PG</option>
                <option value="room">Room</option>
                <option value="apartment">Apartment</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Rent (₹) *
              </label>
              <input
                type="number"
                name="rent"
                value={formData.rent}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Security Deposit (₹) *
              </label>
              <input
                type="number"
                name="deposit"
                value={formData.deposit}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Location Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Address *
              </label>
              <input
                type="text"
                name="location.address"
                value={formData.location.address}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Area *
              </label>
              <input
                type="text"
                name="location.area"
                value={formData.location.area}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                type="text"
                name="location.city"
                value={formData.location.city}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State *
              </label>
              <input
                type="text"
                name="location.state"
                value={formData.location.state}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Distance from College (km) *
              </label>
              <input
                type="number"
                name="location.distanceFromCollege"
                value={formData.location.distanceFromCollege}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Availability */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Availability</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Available From *
              </label>
              <input
                type="date"
                name="availability.availableFrom"
                value={formData.availability.availableFrom}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Beds *
              </label>
              <input
                type="number"
                name="availability.totalBeds"
                value={formData.availability.totalBeds}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Property Images</h2>
          <SimpleImageUpload onImagesChange={setImages} />
          {images.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-600">{images.length} image(s) uploaded</p>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Features & Amenities</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(formData.features).map(([key, value]) => (
              <label key={key} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name={`features.${key}`}
                  checked={value}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tenant Preferences</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender Preference
              </label>
              <select
                name="preferences.gender"
                value={formData.preferences.gender}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="any">Any</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Food Type
              </label>
              <select
                name="preferences.foodType"
                value={formData.preferences.foodType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="both">Both</option>
                <option value="veg">Vegetarian</option>
                <option value="non-veg">Non-Vegetarian</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 mt-6">
              <input
                type="checkbox"
                name="preferences.smoking"
                checked={formData.preferences.smoking}
                onChange={handleInputChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Smoking Allowed</span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Property'}
          </button>
        </div>
      </form>
    </div>
  );
}
