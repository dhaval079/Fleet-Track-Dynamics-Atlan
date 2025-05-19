import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MapPin, Navigation, AlertCircle, Check, Truck, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_KEY = 'AlzaSydVL9oXBRjlq0jaFb8R6J23Jz4fP17mrJA';
const BACKEND_URL = "https://fleet-track-dynamics-atlan.onrender.com";
const driverId = localStorage.getItem('userId');

const DriverLocationUpdate = () => {
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentBookingDetails, setCurrentBookingDetails] = useState(null);

  const autocompleteRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCurrentJobs();
      loadGoogleMapsScript();
    }

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [user]);

  const loadGoogleMapsScript = () => {
    const script = document.createElement('script');
    script.src = `https://maps.gomaps.pro/maps/api/js?key=${API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = initAutocomplete;
    document.head.appendChild(script);
  };

  const initAutocomplete = () => {
    autocompleteRef.current = new window.google.maps.places.Autocomplete(
      document.getElementById('location-input')
    );
    autocompleteRef.current.addListener('place_changed', handlePlaceSelect);
  };

  const handlePlaceSelect = () => {
    const place = autocompleteRef.current.getPlace();
    if (place.geometry) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      
      setLocation({
        lat: lat,
        lng: lng
      });
      setAddress(place.formatted_address);
  
      alert(
        `Selected Location Coordinates:\n` +
        `📍 Latitude: ${lat}\n` +
        `📍 Longitude: ${lng}\n\n` +
        `📌 Address: ${place.formatted_address}`
      );
  
      console.log('Selected coordinates:', { lat, lng });
    }
  };

  const fetchCurrentJobs = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v2/drivers/current-jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ email: user.email })
      });
      if (!response.ok) throw new Error('Failed to fetch current jobs');
      const data = await response.json();
      setBookings(data.bookings);
    } catch (error) {
      console.error('Error fetching current jobs:', error);
      setError('Failed to load current jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location || !user || !selectedBooking) return;

    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/v2/drivers/update-location/${driverId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          latitude: location.lat,
          longitude: location.lng,
          bookingId: selectedBooking
        })
      });

      if (!response.ok) throw new Error('Failed to update location');
      alert('Location updated successfully');
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating location:', error);
      setError('Failed to update location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSelect = (booking) => {
    setSelectedBooking(booking._id);
    setCurrentBookingDetails(booking);
    setIsDropdownOpen(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="p-8 bg-white rounded-2xl shadow-xl text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in to update your location.</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-5 bg-gradient-to-r from-blue-600 to-indigo-600">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Navigation className="w-6 h-6 mr-2" />
              Update Location
            </h2>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Booking Selection */}
              <div className="relative" ref={dropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Delivery</label>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full bg-white px-4 py-3 border border-gray-300 rounded-xl text-left flex items-center justify-between hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <div className="flex items-center">
                    <Truck className="w-5 h-5 text-gray-400 mr-3" />
                    <span className={!selectedBooking ? 'text-gray-500' : 'text-gray-900'}>
                      {currentBookingDetails 
                        ? `${currentBookingDetails.pickup.address.split(',')[0]} → ${currentBookingDetails.dropoff.address.split(',')[0]}`
                        : 'Select a delivery'}
                    </span>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 max-h-60 overflow-auto"
                    >
                      {bookings.map((booking) => (
                        <button
                          key={booking._id}
                          type="button"
                          onClick={() => handleBookingSelect(booking)}
                          className="w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center space-x-3 transition-colors"
                        >
                          <MapPin className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">
                              {booking.pickup.address.split(',')[0]} → {booking.dropoff.address.split(',')[0]}
                            </p>
                            <p className="text-sm text-gray-500">ID: {booking._id.slice(-8)}</p>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Location Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Location</label>
                <input
                  id="location-input"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your current location"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 bg-red-50 rounded-xl border border-red-200 text-red-700 text-sm"
                >
                  {error}
                </motion.div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !location || !selectedBooking}
                className={`w-full px-4 py-3 rounded-xl text-white font-medium flex items-center justify-center space-x-2 transition-all ${
                  loading || !location || !selectedBooking
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : updateSuccess ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Updated Successfully</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-5 h-5" />
                    <span>Update Location</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DriverLocationUpdate;
