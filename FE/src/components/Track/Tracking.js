import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const API_KEY = 'AlzaSy4STdH82R8gHqMhU-oldo3-trDZJZKBWBV';
const BACKEND_URL = 'https://fleet-track-dynamics-atlan.onrender.com';
const NEW_YORK_COORDINATES = { lat: 40.7128, lng: -74.0060 };

const TrackingComponent = () => {
  const [bookingId, setBookingId] = useState('');
  const [rideDetails, setRideDetails] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [socketInstance, setSocketInstance] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    try {
      const socket = io(BACKEND_URL, {
        query: { token: localStorage.getItem('token') },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      socket.on('connect', () => {
        console.log('Socket connected');
        setError(null);
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        // setError('Connection error. Retrying...');
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      socket.on('locationUpdate', (location) => {
        setCurrentLocation(location);
        updateMarkerPosition('current', location);
      });

      setSocketInstance(socket);

      return () => {
        if (socket) {
          socket.disconnect();
        }
      };
    } catch (err) {
      console.error('Socket initialization error:', err);
      // setError('Failed to establish connection');
    }
  }, []);

  useEffect(() => {
    loadGoogleMapsScript();
  }, []);

  const loadGoogleMapsScript = () => {
    if (window.google) {
      initMap();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.gomaps.pro/maps/api/js?key=${API_KEY}`;
    script.async = true;
    script.defer = true;
    script.onload = initMap;
    script.onerror = () => setError('Failed to load map');
    document.head.appendChild(script);
  };

  const initMap = () => {
    if (!mapRef.current) return;

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: NEW_YORK_COORDINATES,
      zoom: 12,
      zoomControl: true,
      mapTypeControl: false,
      scaleControl: true,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: true
    });

    setMap(mapInstance);
  };

  const updateMap = (booking) => {
    if (!map) return;

    const bounds = new window.google.maps.LatLngBounds();
    
    // Clear existing markers
    Object.values(markers).forEach(marker => marker.setMap(null));
    setMarkers({});

    // Add pickup marker
    const pickupMarker = new window.google.maps.Marker({
      position: booking.pickup.coordinates,
      map: map,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: '#4F46E5',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
      },
      title: 'Pickup Location'
    });
    bounds.extend(booking.pickup.coordinates);

    // Add dropoff marker
    const dropoffMarker = new window.google.maps.Marker({
      position: booking.dropoff.coordinates,
      map: map,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: '#7C3AED',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
      },
      title: 'Dropoff Location'
    });
    bounds.extend(booking.dropoff.coordinates);

    const routePath = new window.google.maps.Polyline({
      path: [booking.pickup.coordinates, booking.dropoff.coordinates],
      geodesic: true,
      strokeColor: '#4F46E5',
      strokeOpacity: 0.8,
      strokeWeight: 3
    });
    routePath.setMap(map);

    map.fitBounds(bounds, { padding: 60 });

    setMarkers({
      pickup: pickupMarker,
      dropoff: dropoffMarker,
      route: routePath
    });
  };

  const updateMarkerPosition = (markerType, position) => {
    if (!map) return;

    if (markers[markerType]) {
      markers[markerType].setPosition(position);
    } else {
      const newMarker = new window.google.maps.Marker({
        position: position,
        map: map,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: '#10B981',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        },
        title: 'Current Location'
      });
      setMarkers(prev => ({ ...prev, [markerType]: newMarker }));
    }
  };

  const fetchRideDetails = async () => {
    if (!bookingId.trim()) {
      setError('Please enter a booking ID');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/v2/bookings/${bookingId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(response.status === 404 ? 'Booking not found' : 'Failed to fetch ride details');
      }

      const data = await response.json();
      setRideDetails(data.booking);
      
      if (socketInstance) {
        socketInstance.emit('subscribe', bookingId);
      }

      updateMap(data.booking);
    } catch (error) {
      console.error('Error fetching ride details:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getDriverLocation = async () => {
    if (!rideDetails?._id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/v2/drivers/current-location/${rideDetails._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });

      if (!response.ok) throw new Error('Failed to fetch driver location');

      const data = await response.json();
      if (data.success && data.driverLocation) {
        const location = {
          lat: data.driverLocation[1],
          lng: data.driverLocation[0]
        };
        updateMarkerPosition('driver', location);
      } else {
        throw new Error(data.message || 'Driver location not available');
      }
    } catch (error) {
      console.error('Error fetching driver location:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

 return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      {/* Left Panel - Made scrollable independently on mobile */}
      <div className="w-full md:w-[480px] h-[45vh] md:h-full bg-white shadow-xl z-10 overflow-y-auto order-2 md:order-1">
        <div className="p-4 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8">Track My Ride</h1>
          
          {/* Search Section */}
          <div className="mb-6 md:mb-8">
            <div className="relative group">
              <input
                type="text"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                placeholder="Enter Booking ID"
                className="w-full px-4 md:px-6 py-3 md:py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-indigo-500 transition-all duration-300 text-gray-900 placeholder-gray-400"
              />
            </div>
            <button
              onClick={fetchRideDetails}
              disabled={isLoading}
              className="mt-3 md:mt-4 w-full px-4 md:px-6 py-3 md:py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium transform hover:translate-y-[-2px] hover:shadow-lg transition-all duration-300 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <span className="w-4 h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  Searching...
                </span>
              ) : (
                'Track Ride'
              )}
            </button>
            
            {error && (
              <div className="mt-3 md:mt-4 p-3 md:p-4 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Ride Details */}
          {rideDetails && (
            <div className="space-y-4 md:space-y-6 animate-fadeIn">
              <div className="p-3 md:p-4 bg-gray-50 rounded-xl">
                <div className="text-sm text-gray-500">Tracking ID</div>
                <div className="font-mono text-gray-900 text-sm md:text-base">{bookingId}</div>
              </div>

              <div className="relative pl-8 py-4">
                <div className="absolute left-0 top-6 w-[2px] h-[calc(100%-48px)] bg-gradient-to-b from-indigo-500 to-purple-500 rounded"></div>
                
                <div className="relative mb-6 md:mb-8">
                  <div className="absolute left-[-15px] w-6 h-6 md:w-8 md:h-8 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                    <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                  </div>
                  <div className="text-sm text-gray-500 mb-1">From</div>
                  <div className="text-gray-900 font-medium text-sm md:text-base">{rideDetails.pickup.address}</div>
                </div>

                <div className="relative">
                  <div className="absolute left-[-15px] w-6 h-6 md:w-8 md:h-8 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                    <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                  </div>
                  <div className="text-sm text-gray-500 mb-1">To</div>
                  <div className="text-gray-900 font-medium text-sm md:text-base">{rideDetails.dropoff.address}</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-500">Status</span>
                <span className="px-3 md:px-4 py-1.5 md:py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium capitalize">
                  {rideDetails.status}
                </span>
              </div>

              {rideDetails.status !== 'completed' && (
                <button
                  onClick={getDriverLocation}
                  disabled={isLoading}
                  className="w-full px-4 md:px-6 py-3 md:py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-medium transform hover:translate-y-[-2px] hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <span className="w-4 h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                      Locating Driver...
                    </span>
                  ) : (
                    'Get Driver Location'
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Map Panel - Moved to top on mobile */}
      <div className="flex-1 h-[55vh] md:h-full relative order-1 md:order-2">
        <div ref={mapRef} className="absolute inset-0 z-0 w-full h-full"></div>
      </div>
    </div>
  );
};

export default TrackingComponent;
