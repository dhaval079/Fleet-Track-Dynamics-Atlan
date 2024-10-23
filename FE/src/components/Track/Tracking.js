import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const API_KEY = 'AlzaSy4STdH82R8gHqMhU-oldo3-trDZJZKBWBV';
const BACKEND_URL = 'https://fleet-track-dynamics-atlan.onrender.com';

const TrackingComponent = () => {
  const [bookingId, setBookingId] = useState('');
  const [rideDetails, setRideDetails] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [socket, setSocket] = useState(null);
  const mapRef = useRef(null);
  const inputRef = useRef(null);

  // Socket setup and Google Maps initialization remains the same...
  useEffect(() => {
    const newSocket = io(BACKEND_URL, {
      query: { token: localStorage.getItem('token') }
    });
    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('locationUpdate', (location) => {
        setCurrentLocation(location);
        updateMarkerPosition('current', location);
      });
    }
  }, [socket]);

  // Map initialization code remains the same...
  useEffect(() => {
    loadGoogleMapsScript();
  }, []);

  const loadGoogleMapsScript = () => {
    const script = document.createElement('script');
    script.src = `https://maps.gomaps.pro/maps/api/js?key=${API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = initMap;
    document.head.appendChild(script);
  };

  const initMap = () => {
    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: { lat: 0, lng: 0 },
      zoom: 10,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
        }
      ]
    });
    setMap(mapInstance);
  };

  const fetchRideDetails = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/v2/bookings/${bookingId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch ride details');
      const data = await response.json();
      setRideDetails(data.booking);
      if (socket) {
        socket.emit('subscribe', bookingId);
      }
      setShowResults(true);
      updateMap(data.booking);
    } catch (error) {
      console.error('Error fetching ride details:', error);
      alert('Failed to fetch ride details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Map update functions remain the same...
  const updateMap = (booking) => {
    if (!map) return;
    // ... existing map update code ...
  };

  const updateMarkerPosition = (markerType, position) => {
    if (!map) return;
    // ... existing marker update code ...
  };

  const getDriverLocation = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/v2/drivers/current-location/${rideDetails._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      // ... rest of the driver location code ...
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg animate-fadeIn">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-400 rounded-full animate-pulse"></div>
              <h1 className="text-white text-xl font-bold">RideStream</h1>
            </div>
            <nav className="flex items-center space-x-6">
              <a href="#" className="text-blue-100 hover:text-white transition-colors">Home</a>
              <a href="#" className="text-blue-100 hover:text-white transition-colors">Driver</a>
              <a href="#" className="text-blue-100 hover:text-white transition-colors">Profile</a>
              <button className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-400 transition-all transform hover:scale-105">
                Track Ride
              </button>
            </nav>
            <button className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition-all transform hover:scale-105">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 animate-slideUp">
        <div className={`bg-white rounded-2xl shadow-xl p-8 transition-all duration-500 transform ${showResults ? 'translate-y-0' : 'translate-y-4'}`}>
          <h2 className="text-3xl font-bold text-blue-900 mb-6 animate-fadeIn">Track My Ride</h2>
          
          {/* Input Section */}
          <div className={`transition-all duration-500 ${showResults ? 'mb-8' : 'mb-0'}`}>
            <div className="relative group">
              <input
                ref={inputRef}
                type="text"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                placeholder="Enter Booking ID"
                className="w-full px-6 py-4 bg-blue-50 border-2 border-blue-100 rounded-xl focus:outline-none focus:border-blue-500 transition-all placeholder-blue-300 text-blue-900"
              />
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></div>
            </div>
            <button
              onClick={fetchRideDetails}
              disabled={isLoading}
              className="mt-4 w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium transform hover:translate-y-[-2px] hover:shadow-lg transition-all duration-300 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  Processing...
                </span>
              ) : (
                'Track Ride'
              )}
            </button>
          </div>

          {/* Results Section */}
          {rideDetails && (
            <div className="animate-fadeIn">
              <div className="bg-blue-50 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-blue-500 font-medium">Tracking ID:</span>
                  <span className="text-blue-900 font-mono">{bookingId}</span>
                </div>
                
                <div className="relative pl-8 mb-6">
                  <div className="absolute left-0 top-0 w-1 h-full bg-blue-200 rounded"></div>
                  <div className="relative mb-6">
                    <div className="absolute left-[-14px] w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                    <p className="text-sm text-blue-500 mb-1">From</p>
                    <p className="text-blue-900 font-medium">{rideDetails.pickup.address}</p>
                  </div>
                  <div className="relative">
                    <div className="absolute left-[-14px] w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                    <p className="text-sm text-blue-500 mb-1">To</p>
                    <p className="text-blue-900 font-medium">{rideDetails.dropoff.address}</p>
                  </div>
                </div>

                <div className="inline-block px-4 py-2 bg-blue-100 rounded-full">
                  <span className="text-blue-700 font-medium capitalize">{rideDetails.status}</span>
                </div>
              </div>

              <div className="rounded-xl overflow-hidden shadow-lg mb-6 transition-all duration-300 hover:shadow-xl">
                <div ref={mapRef} className="w-full h-[400px]"></div>
              </div>

              {rideDetails.status !== 'completed' && (
                <button
                  onClick={getDriverLocation}
                  disabled={isLoading}
                  className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-medium transform hover:translate-y-[-2px] hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                      Fetching Location...
                    </span>
                  ) : (
                    'Get Driver Location'
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TrackingComponent;
