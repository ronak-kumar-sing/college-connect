'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  XMarkIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface OwnerSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  user: User;
}

const navigation = [
  { name: 'Dashboard', href: '/owner/dashboard', icon: HomeIcon },
  { name: 'Properties', href: '/owner/properties', icon: BuildingOfficeIcon },
  { name: 'Bookings', href: '/owner/bookings', icon: CalendarDaysIcon },
  { name: 'Analytics', href: '/owner/analytics', icon: ChartBarIcon },
  { name: 'Settings', href: '/owner/settings', icon: Cog6ToothIcon },
];

export default function OwnerSidebar({ isOpen, onToggle, user }: OwnerSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:w-16'}
      `}>
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <div className={`flex items-center ${isOpen ? '' : 'lg:justify-center'}`}>
            <Link href="/owner/dashboard" className="text-xl font-bold text-blue-600">
              {isOpen || !isOpen ? 'CC Owner' : 'CC'}
            </Link>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* User info */}
          <div className={`p-4 border-b ${isOpen ? '' : 'lg:px-2'}`}>
            <div className={`flex items-center ${isOpen ? 'space-x-3' : 'lg:justify-center'}`}>
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <UserCircleIcon className="w-10 h-10 text-gray-400" />
              )}
              {(isOpen) && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.name}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {user.email}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors
                    ${isActive
                      ? 'bg-blue-100 text-blue-900 border-r-2 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                    ${isOpen ? '' : 'lg:justify-center lg:px-3'}
                  `}
                >
                  <item.icon
                    className={`
                      flex-shrink-0 h-6 w-6
                      ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}
                      ${isOpen ? 'mr-3' : ''}
                    `}
                  />
                  {(isOpen) && item.name}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-2 border-t">
            <button
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' });
                window.location.href = '/login';
              }}
              className={`
                group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md
                text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors
                ${isOpen ? '' : 'lg:justify-center lg:px-3'}
              `}
            >
              <svg className={`flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-red-500 ${isOpen ? 'mr-3' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1" />
              </svg>
              {(isOpen) && 'Logout'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
