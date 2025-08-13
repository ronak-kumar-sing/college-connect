'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Bars3Icon,
  BellIcon,
  PlusIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface OwnerHeaderProps {
  user: User;
  onMenuClick: () => void;
}

export default function OwnerHeader({ user, onMenuClick }: OwnerHeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left section */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Owner Dashboard</h1>
              <p className="text-sm text-gray-600">Manage your properties and bookings</p>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-4">
            {/* Add Property Button */}
            <Link
              href="/owner/properties/create"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Property
            </Link>

            {/* Notifications */}
            <button className="p-2 text-gray-400 hover:text-gray-500 relative">
              <BellIcon className="h-6 w-6" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-3 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <UserCircleIcon className="h-8 w-8" />
                )}
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
                  <Link
                    href="/owner/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowDropdown(false)}
                  >
                    Your Profile
                  </Link>
                  <Link
                    href="/owner/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowDropdown(false)}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={async () => {
                      await fetch('/api/auth/logout', { method: 'POST' });
                      window.location.href = '/login';
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </header>
  );
}
