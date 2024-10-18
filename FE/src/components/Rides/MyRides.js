import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Clock, Truck, User, DollarSign, Tag } from 'lucide-react';

const UserBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

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
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'completed': return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), "MMMM d, yyyy 'at' h:mm a");
  };

  const filteredBookings = bookings.filter(booking => 
    filter === 'all' || booking.status === filter
  );

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="text-center mt-8 text-red-600 bg-red-100 p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-2">Error</h2>
      <p>{error}</p>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">My Rides</h1>
      
      <div className="mb-6 flex justify-center space-x-2">
        {['all', 'pending', 'completed', 'cancelled', 'scheduled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
              filter === status
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {filteredBookings.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">No bookings found for the selected filter.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookings.map((booking, index) => (
            <motion.div
              key={booking._id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="px-6 py-4">
                <div className="font-bold text-xl mb-2 text-gray-800">Booking #{booking._id.slice(-6)}</div>
                <div className="space-y-2">
                  <p className="text-gray-700 flex items-center">
                    <MapPin className="mr-2 text-blue-500" size={18} />
                    <span className="font-semibold">From:</span> {booking.pickup.address}
                  </p>
                  <p className="text-gray-700 flex items-center">
                    <MapPin className="mr-2 text-red-500" size={18} />
                    <span className="font-semibold">To:</span> {booking.dropoff.address}
                  </p>
                  <p className="text-gray-700 flex items-center">
                    <User className="mr-2 text-green-500" size={18} />
                    <span className="font-semibold">Driver:</span> {booking.driver.username}
                  </p>
                  <p className="text-gray-700 flex items-center">
                    <Truck className="mr-2 text-purple-500" size={18} />
                    <span className="font-semibold">Vehicle:</span> {booking.vehicle.make} {booking.vehicle.model} ({booking.vehicle.vehicleType})
                  </p>
                  <p className="text-gray-700 flex items-center">
                    <Tag className="mr-2 text-yellow-500" size={18} />
                    <span className="font-semibold">License Plate:</span> {booking.vehicle.licensePlate}
                  </p>
                  <p className="text-gray-700 flex items-center">
                    <DollarSign className="mr-2 text-green-500" size={18} />
                    <span className="font-semibold">Price:</span> ${booking.price.toFixed(2)}
                  </p>
                  <p className="text-gray-700 flex items-center">
                    <Calendar className="mr-2 text-blue-500" size={18} />
                    <span className="font-semibold">Date:</span> {formatDate(booking.createdAt)}
                  </p>
                  {booking.status === 'scheduled' && booking.scheduledTime && (
                    <p className="text-gray-700 flex items-center">
                      <Clock className="mr-2 text-indigo-500" size={18} />
                      <span className="font-semibold">Scheduled:</span> {formatDate(booking.scheduledTime)}
                    </p>
                  )}
                </div>
              </div>
              <div className="px-6 pt-4 pb-2">
                <span className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${getStatusColor(booking.status)}`}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserBookings;