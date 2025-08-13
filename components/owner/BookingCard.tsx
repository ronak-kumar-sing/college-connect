'use client';

interface Booking {
  id: string;
  property: {
    title: string;
    type: string;
  };
  tenant: {
    name: string;
    email: string;
  };
  status: string;
  startDate: string;
  monthlyRent: number;
  bookingDate: string;
}

interface BookingCardProps {
  booking: Booking;
  showActions?: boolean;
}

export default function BookingCard({ booking, showActions = true }: BookingCardProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="font-medium text-gray-900 text-sm">{booking.property.title}</h3>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
              {booking.status}
            </span>
          </div>

          <div className="space-y-1 text-sm text-gray-600">
            <p><strong>Tenant:</strong> {booking.tenant.name}</p>
            <p><strong>Email:</strong> {booking.tenant.email}</p>
            <p><strong>Start Date:</strong> {formatDate(booking.startDate)}</p>
            <p><strong>Rent:</strong> ₹{booking.monthlyRent.toLocaleString()}/month</p>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        <span>Booked on {formatDate(booking.bookingDate)}</span>

        {showActions && (
          <div className="flex space-x-2">
            {booking.status === 'pending' && (
              <>
                <button className="px-3 py-1 text-green-600 bg-green-50 rounded hover:bg-green-100 transition-colors">
                  Accept
                </button>
                <button className="px-3 py-1 text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors">
                  Decline
                </button>
              </>
            )}
            <button className="px-3 py-1 text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors">
              View Details
            </button>
          </div>
        )}
      </div>
    </div>
  );
}