// components/owner/ImageUpload.tsx
'use client'
import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'
import { Upload, X, Star, Image as ImageIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ImageFile {
  id: string
  file: File
  preview: string
  uploaded?: boolean
  url?: string
  isPrimary?: boolean
}

interface ImageUploadProps {
  images: ImageFile[]
  onImagesChange: (images: ImageFile[]) => void
  maxImages?: number
  maxSize?: number // in MB
}

export function ImageUpload({
  images,
  onImagesChange,
  maxImages = 10,
  maxSize = 5
}: ImageUploadProps) {
  const [uploading, setUploading] = useState<string[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newImages: ImageFile[] = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      uploaded: false
    }))

    const totalImages = images.length + newImages.length
    if (totalImages > maxImages) {
      alert(`Maximum ${maxImages} images allowed`)
      return
    }

    onImagesChange([...images, ...newImages])

    // Auto upload images
    newImages.forEach(uploadImage)
  }, [images, maxImages, onImagesChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: maxSize * 1024 * 1024,
    multiple: true
  })

  const uploadImage = async (image: ImageFile) => {
    setUploading(prev => [...prev, image.id])

    const formData = new FormData()
    formData.append('image', image.file)

    try {
      const response = await fetch('/api/owner/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()

        onImagesChange(prev =>
          prev.map(img =>
            img.id === image.id
              ? { ...img, uploaded: true, url: data.url }
              : img
          )
        )
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload image. Please try again.')
    } finally {
      setUploading(prev => prev.filter(id => id !== image.id))
    }
  }

  const removeImage = (imageId: string) => {
    onImagesChange(prev => prev.filter(img => img.id !== imageId))
  }

  const setPrimaryImage = (imageId: string) => {
    onImagesChange(prev =>
      prev.map(img => ({
        ...img,
        isPrimary: img.id === imageId
      }))
    )
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-3">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <Upload className="h-6 w-6 text-gray-600" />
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900">
              {isDragActive ? 'Drop images here' : 'Upload property images'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Drag & drop or click to select images (Max {maxImages} images, {maxSize}MB each)
            </p>
          </div>
          <Button type="button" variant="outline" size="sm">
            <ImageIcon className="h-4 w-4 mr-2" />
            Choose Files
          </Button>
        </div>
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative group border rounded-lg overflow-hidden bg-gray-50"
            >
              <div className="aspect-square relative">
                <Image
                  src={image.preview}
                  alt="Property image"
                  fill
                  className="object-cover"
                />

                {/* Loading overlay */}
                {uploading.includes(image.id) && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  </div>
                )}

                {/* Actions overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setPrimaryImage(image.id)}
                      className={`
                        text-white hover:bg-white/20
                        ${image.isPrimary ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
                      `}
                      title="Set as primary image"
                    >
                      <Star className={`h-4 w-4 ${image.isPrimary ? 'fill-current' : ''}`} />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeImage(image.id)}
                      className="text-white hover:bg-red-500/20"
                      title="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Status indicators */}
                <div className="absolute top-2 left-2 flex space-x-1">
                  {image.isPrimary && (
                    <div className="bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                      Primary
                    </div>
                  )}
                  {image.uploaded && (
                    <div className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                      ✓
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Image Guidelines:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Upload high-quality images (minimum 800x600 pixels)</li>
          <li>• First image will be used as the main display image</li>
          <li>• Include photos of rooms, common areas, bathrooms, and exterior</li>
          <li>• Avoid uploading personal information or faces</li>
          <li>• Supported formats: JPG, PNG, WebP</li>
        </ul>
      </div>
    </div>
  )
}
