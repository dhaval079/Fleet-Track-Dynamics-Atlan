import React, { useState, useEffect } from 'react';

const UserBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserBookings();
  }, []);

  const fetchUserBookings = async () => {
    try {
      setLoading(true);
      const userEmail = localStorage.getItem('email');

      if (!userEmail) {
        setError('User email not found. Please log in again.');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:3001/api/v2/bookings/userbookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ email: userEmail })
      });

      const data = await response.json();
      if (data.success) {
        setBookings(data.bookings);
      } else {
        setError(data.message || 'Failed to fetch bookings');
      }
    } catch (error) {
      setError('Error fetching bookings. Please try again later.');
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-200 text-yellow-800';
      case 'completed': return 'bg-green-200 text-green-800';
      case 'cancelled': return 'bg-red-200 text-red-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) return <div className="text-center mt-8">Loading...</div>;
  if (error) return <div className="text-center mt-8 text-red-600">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Rides</h1>
      {bookings.length === 0 ? (
        <p className="text-center">You have no bookings yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map(booking => (
            <div key={booking._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4">
                <div className="font-bold text-xl mb-2">Booking #{booking._id.slice(-6)}</div>
                <p className="text-gray-700 text-base mb-2">
                  <span className="font-semibold">From:</span> {booking.pickup.address}
                </p>
                <p className="text-gray-700 text-base mb-2">
                  <span className="font-semibold">To:</span> {booking.dropoff.address}
                </p>
                <p className="text-gray-700 text-base mb-2">
                  <span className="font-semibold">Driver:</span> {booking.driver.username}
                </p>
                <p className="text-gray-700 text-base mb-2">
                  <span className="font-semibold">Vehicle:</span> {booking.vehicle.make} {booking.vehicle.model} ({booking.vehicle.vehicleType})
                </p>
                <p className="text-gray-700 text-base mb-2">
                  <span className="font-semibold">License Plate:</span> {booking.vehicle.licensePlate}
                </p>
                <p className="text-gray-700 text-base mb-2">
                  <span className="font-semibold">Price:</span> ${booking.price.toFixed(2)}
                </p>
                <p className="text-gray-700 text-base mb-2">
                  <span className="font-semibold">Date:</span> {formatDate(booking.createdAt)}
                </p>
              </div>
              <div className="px-6 pt-4 pb-2">
                <span className={`inline-block rounded-full px-3 py-1 text-sm font-semibold mr-2 mb-2 ${getStatusColor(booking.status)}`}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserBookings;