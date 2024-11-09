import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Clock, Truck, User, DollarSign, Tag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../context/SearchContext';

const statusOptions = ['all', 'pending', 'assigned', 'en_route', 'goods_collected', 'completed', 'cancelled', 'scheduled'];
const BACKEND_URL = "https://fleet-track-dynamics-atlan.onrender.com";


const getStatusColor = (status) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'completed': return 'bg-green-100 text-green-800 border-green-300';
    case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
    case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'assigned': return 'bg-purple-100 text-purple-800 border-purple-300';
    case 'en_route': return 'bg-indigo-100 text-indigo-800 border-indigo-300';
    case 'goods_collected': return 'bg-teal-100 text-teal-800 border-teal-300';
    default: return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

const MyRides = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const { searchQuery } = useSearch();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const userEmail = localStorage.getItem('email');
    const token = localStorage.getItem('token');

    if (!userEmail || !token) {
      navigate('/login');
      return;
    }

    fetchUserBookings(userEmail, token);
  }, [navigate]);

  const fetchUserBookings = async (userEmail, token) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${BACKEND_URL}/api/v2/bookings/userbookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: userEmail })
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('email');
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      if (data.success) {
        setBookings(data.bookings);
      } else {
        throw new Error(data.message || 'Failed to fetch bookings');
      }
    } catch (error) {
      setError('Error fetching bookings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMMM d, yyyy 'at' h:mm a");
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const filteredBookings = bookings?.filter(booking => {
    const matchesStatus = filter === 'all' || booking.status === filter;
    
    if (!searchQuery) return matchesStatus;

    const searchLower = searchQuery.toLowerCase();
    const pickupMatch = booking.pickup.address.toLowerCase().includes(searchLower);
    const dropoffMatch = booking.dropoff.address.toLowerCase().includes(searchLower);

    return matchesStatus && (pickupMatch || dropoffMatch);
  }) || [];

  if (error) {
    return (
      <div className="text-center mt-8 text-red-600 bg-red-100 p-4 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p>{error}</p>
        <button 
          onClick={() => fetchUserBookings(localStorage.getItem('email'), localStorage.getItem('token'))}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Rides</h1>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-2xl font-bold text-blue-600">{bookings.length}</h3>
            <p className="text-gray-600">Total Rides</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-2xl font-bold text-green-600">
              {bookings.filter(b => b.status === 'completed').length}
            </h3>
            <p className="text-gray-600">Completed</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-2xl font-bold text-yellow-600">
              {bookings.filter(b => ['pending', 'assigned', 'en_route'].includes(b.status)).length}
            </h3>
            <p className="text-gray-600">In Progress</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-2xl font-bold text-red-600">
              {bookings.filter(b => b.status === 'cancelled').length}
            </h3>
            <p className="text-gray-600">Cancelled</p>
          </div>
        </motion.div>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {statusOptions.map((status) => (
            <motion.button
              key={status}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(status)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                filter === status
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
            </motion.button>
          ))}
        </div>

        {/* Bookings Grid */}
        {filteredBookings.length === 0 ? (
          <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-12 bg-white rounded-xl shadow-sm"
    >
      {searchQuery ? (
        <div>
          <p className="text-gray-600 text-lg mb-2">No rides found matching "{searchQuery}"</p>
          <p className="text-gray-500">Try a different search term or filter</p>
        </div>
      ) : (
        <div>
          {/* <p className="text-gray-600 text-lg mb-2">No rides found</p>
          <p className="text-gray-500">Try selecting a different status filter</p> */}
        </div>
      )}
    </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBookings.map((booking, index) => (
              <motion.div
                key={booking._id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                {/* Card Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Booking ID</p>
                      <h3 className="text-lg font-semibold text-gray-900">#{booking._id}</h3>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1).replace('_', ' ')}
                    </span>
                  </div>

                  {/* Route Information */}
                  <div className="relative pl-8 mt-6">
                    <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gray-200"/>
                    <div className="relative mb-6">
                      <div className="absolute left-[-1.25rem] w-3 h-3 rounded-full bg-blue-500"/>
                      <p className="text-sm text-gray-500">From</p>
                      <p className="text-gray-900">{booking.pickup.address}</p>
                    </div>
                    <div className="relative">
                      <div className="absolute left-[-1.25rem] w-3 h-3 rounded-full bg-red-500"/>
                      <p className="text-sm text-gray-500">To</p>
                      <p className="text-gray-900">{booking.dropoff.address}</p>
                    </div>
                  </div>
                </div>

                {/* Card Details */}
                <div className="p-6 bg-gray-50">
                  <div className="grid grid-cols-2 gap-4">
                    {booking.driver && (
                      <div>
                        <div className="flex items-center mb-1">
                          <User className="w-4 h-4 text-gray-400 mr-2"/>
                          <p className="text-sm text-gray-500">Driver</p>
                        </div>
                        <p className="text-gray-900 font-medium">{booking.driver.username}</p>
                      </div>
                    )}
                    {booking.vehicle && (
                      <div>
                        <div className="flex items-center mb-1">
                          <Truck className="w-4 h-4 text-gray-400 mr-2"/>
                          <p className="text-sm text-gray-500">Vehicle</p>
                        </div>
                        <p className="text-gray-900 font-medium">
                          {booking.vehicle.make} {booking.vehicle.model}
                        </p>
                      </div>
                    )}
                    {booking.vehicle && (
                      <div>
                        <div className="flex items-center mb-1">
                          <Tag className="w-4 h-4 text-gray-400 mr-2"/>
                          <p className="text-sm text-gray-500">License</p>
                        </div>
                        <p className="text-gray-900 font-medium">{booking.vehicle.licensePlate}</p>
                      </div>
                    )}
                    <div>
                      <div className="flex items-center mb-1">
                        <DollarSign className="w-4 h-4 text-gray-400 mr-2"/>
                        <p className="text-sm text-gray-500">Price</p>
                      </div>
                      <p className="text-emerald-600 font-semibold">${booking.price?.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2"/>
                      <p className="text-sm text-gray-500">{formatDate(booking.createdAt)}</p>
                    </div>
                    {booking.status === 'scheduled' && booking.scheduledTime && (
                      <div className="flex items-center mt-2">
                        <Clock className="w-4 h-4 text-gray-400 mr-2"/>
                        <p className="text-sm text-gray-500">{formatDate(booking.scheduledTime)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRides;
