'use client'
import React, { useState } from 'react'
import { Header } from '@/components/dashboard/Header'
import { HorizontalFilterPanel } from '@/components/dashboard/HorizontalFilterPanel'
import { FilterOptions } from '@/lib/types/room'
import { Room } from '@/lib/types/room'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: [1000, 50000],
    roomType: [],
    gender: 'any',
    amenities: [],
    location: '',
    availability: '',
    furnished: null,
    sortBy: 'newest'
  })

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
  }

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters)
  }

  const handleRoomSelect = (room: Room) => {
    // Handle room selection - could navigate to room details or open modal
    console.log('Selected room:', room)
  }

  // Pass filters and search to children via React Context or props
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        filters,
        searchQuery,
        onFiltersChange: handleFiltersChange,
        onSearchChange: handleSearchChange
      } as any)
    }
    return child
  })

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <Header
        onMenuClick={() => { }} // No longer needed since we removed sidebar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onRoomSelect={handleRoomSelect}
      />

      {/* Horizontal Filter Panel */}
      <HorizontalFilterPanel
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {childrenWithProps}
      </main>
    </div>
  )
}
