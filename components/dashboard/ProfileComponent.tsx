'use client'
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import {
  User,
  Phone,
  Mail,
  School,
  BookOpen,
  Calendar,
  Edit3,
  Save,
  X,
  MapPin,
  Badge as BadgeIcon,
  LogOut
} from 'lucide-react'

interface UserProfile {
  _id?: string
  username: string
  name: string
  email: string
  phone: string
  userType: 'student' | 'faculty' | 'other'
  collegeRegistrationNo?: string
  college?: string
  department?: string
  year?: number
  designation?: string
  verified: boolean
}

interface ProfileComponentProps {
  isOpen: boolean
  onClose: () => void
}

export function ProfileComponent({ isOpen, onClose }: ProfileComponentProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const fetchProfile = async () => {
    try {
      setLoading(true)
      // In a real app, you'd get the user ID from auth context
      const response = await fetch('/api/auth/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data.user)
        setEditedProfile(data.user)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!editedProfile) return

    try {
      setSaving(true)
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedProfile)
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data.user)
        setIsEditing(false)
      } else {
        console.error('Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditedProfile(profile)
    setIsEditing(false)
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      window.location.href = '/login'
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    if (!editedProfile) return
    setEditedProfile({
      ...editedProfile,
      [field]: value
    })
  }

  useEffect(() => {
    if (isOpen && !profile) {
      fetchProfile()
    }
  }, [isOpen])

  const getUserTypeColor = (type: string) => {
    switch (type) {
      case 'student': return 'bg-blue-100 text-blue-800'
      case 'faculty': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Profile" className="max-w-2xl">
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : profile ? (
        <div className="space-y-6">

          {/* Profile Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {profile.name}
                </h2>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUserTypeColor(profile.userType)}`}>
                    {profile.userType.charAt(0).toUpperCase() + profile.userType.slice(1)}
                  </span>
                  {profile.verified && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center">
                      <BadgeIcon className="h-3 w-3 mr-1" />
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                disabled={saving}
              >
                {isEditing ? (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Profile Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Username</label>
                    {isEditing && editedProfile ? (
                      <Input
                        value={editedProfile.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 mt-1">{profile.username}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    {isEditing && editedProfile ? (
                      <Input
                        value={editedProfile.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 mt-1">{profile.name}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    {isEditing && editedProfile ? (
                      <Input
                        type="email"
                        value={editedProfile.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 mt-1">{profile.email}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    {isEditing && editedProfile ? (
                      <Input
                        value={editedProfile.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 mt-1">{profile.phone}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Academic Information</h3>

              <div className="space-y-3">
                {profile.collegeRegistrationNo && (
                  <div className="flex items-center space-x-3">
                    <BadgeIcon className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700">Registration No.</label>
                      {isEditing && editedProfile ? (
                        <Input
                          value={editedProfile.collegeRegistrationNo || ''}
                          onChange={(e) => handleInputChange('collegeRegistrationNo', e.target.value)}
                          className="mt-1"
                        />
                      ) : (
                        <p className="text-sm text-gray-900 mt-1">{profile.collegeRegistrationNo}</p>
                      )}
                    </div>
                  </div>
                )}

                {profile.college && (
                  <div className="flex items-center space-x-3">
                    <School className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700">College</label>
                      {isEditing && editedProfile ? (
                        <Input
                          value={editedProfile.college || ''}
                          onChange={(e) => handleInputChange('college', e.target.value)}
                          className="mt-1"
                        />
                      ) : (
                        <p className="text-sm text-gray-900 mt-1">{profile.college}</p>
                      )}
                    </div>
                  </div>
                )}

                {profile.department && (
                  <div className="flex items-center space-x-3">
                    <BookOpen className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700">Department</label>
                      {isEditing && editedProfile ? (
                        <Input
                          value={editedProfile.department || ''}
                          onChange={(e) => handleInputChange('department', e.target.value)}
                          className="mt-1"
                        />
                      ) : (
                        <p className="text-sm text-gray-900 mt-1">{profile.department}</p>
                      )}
                    </div>
                  </div>
                )}

                {profile.userType === 'student' && profile.year && (
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700">Year</label>
                      {isEditing && editedProfile ? (
                        <select
                          value={editedProfile.year || ''}
                          onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select Year</option>
                          <option value="1">1st Year</option>
                          <option value="2">2nd Year</option>
                          <option value="3">3rd Year</option>
                          <option value="4">4th Year</option>
                        </select>
                      ) : (
                        <p className="text-sm text-gray-900 mt-1">{profile.year}st Year</p>
                      )}
                    </div>
                  </div>
                )}

                {profile.userType === 'faculty' && profile.designation && (
                  <div className="flex items-center space-x-3">
                    <BadgeIcon className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700">Designation</label>
                      {isEditing && editedProfile ? (
                        <Input
                          value={editedProfile.designation || ''}
                          onChange={(e) => handleInputChange('designation', e.target.value)}
                          className="mt-1"
                        />
                      ) : (
                        <p className="text-sm text-gray-900 mt-1">{profile.designation}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">Failed to load profile information</p>
          <Button variant="outline" onClick={fetchProfile} className="mt-2">
            Retry
          </Button>
        </div>
      )}
    </Modal>
  )
}
