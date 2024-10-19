import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const API_KEY = 'AlzaSy4STdH82R8gHqMhU-oldo3-trDZJZKBWBV'; // Replace with your actual API key

const TrackingComponent = () => {
  const [bookingId, setBookingId] = useState('');
  const [rideDetails, setRideDetails] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState({});
  const mapRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const newSocket = io('https://fleet-track-dynamics-atlan.onrender.com', {
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
      const response = await fetch(`https://fleet-track-dynamics-atlan.onrender.com/api/v2/bookings/${bookingId}`, {
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
      updateMap(data.booking);
    } catch (error) {
      console.error('Error fetching ride details:', error);
      alert('Failed to fetch ride details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateMap = (booking) => {
    if (!map) return;

    const bounds = new window.google.maps.LatLngBounds();
    
    // Add origin marker
    const originMarker = new window.google.maps.Marker({
      position: booking.pickup.coordinates,
      map: map,
      title: 'Pickup',
      label: {
        text: 'P',
        color: 'white',
        fontSize: '14px',
        fontWeight: 'bold'
      },
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        fillColor: '#4CAF50',
        fillOpacity: 1,
        strokeWeight: 0,
        scale: 12
      }
    });
    bounds.extend(booking.pickup.coordinates);
    setMarkers(prev => ({ ...prev, origin: originMarker }));

    // Add destination marker
    const destinationMarker = new window.google.maps.Marker({
      position: booking.dropoff.coordinates,
      map: map,
      title: 'Destination',
      label: {
        text: 'D',
        color: 'white',
        fontSize: '14px',
        fontWeight: 'bold'
      },
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        fillColor: '#F44336',
        fillOpacity: 1,
        strokeWeight: 0,
        scale: 12
      }
    });
    bounds.extend(booking.dropoff.coordinates);
    setMarkers(prev => ({ ...prev, destination: destinationMarker }));

    // Fit map to show both markers
    map.fitBounds(bounds);
  };

  const updateMarkerPosition = (markerType, position) => {
    if (!map) return;

    if (markers[markerType]) {
      markers[markerType].setPosition(position);
    } else {
      const newMarker = new window.google.maps.Marker({
        position: position,
        map: map,
        title: markerType === 'current' ? 'Current Location' : 'Unknown',
        icon: markerType === 'current' ? {
          url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          scaledSize: new window.google.maps.Size(40, 40)
        } : null
      });
      setMarkers(prev => ({ ...prev, [markerType]: newMarker }));
    }
  };

  const getDriverLocation = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://fleet-track-dynamics-atlan.onrender.com/api/v2/drivers/current-location/${rideDetails._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
  
      if (!response.ok) throw new Error('Failed to fetch driver location');
  
      const data = await response.json();
      if (data.success) {
        const driverCoordinates = data.driverLocation;
        const location = {
          lat: driverCoordinates[1],
          lng: driverCoordinates[0]
        };
        updateMarkerPosition('driver', location);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error fetching driver location:', error);
      alert('Failed to fetch driver location. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Track My Ride</h2>
      <div className="mb-6">
        <input
          type="text"
          value={bookingId}
          onChange={(e) => setBookingId(e.target.value)}
          placeholder="Enter Booking ID"
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button 
          onClick={fetchRideDetails} 
          className="mt-3 w-full p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300 ease-in-out"
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Track Ride'}
        </button>
      </div>
      {rideDetails && (
        <div className="mb-6 p-4 bg-gray-100 rounded-md">
          <p className="mb-2"><strong>From:</strong> {rideDetails.pickup.address}</p>
          <p className="mb-2"><strong>To:</strong> {rideDetails.dropoff.address}</p>
          <p><strong>Status:</strong> <span className="capitalize">{rideDetails.status}</span></p>
        </div>
      )}
      <div ref={mapRef} style={{ width: '100%', height: '400px' }} className="mb-6 rounded-lg overflow-hidden shadow-md"></div>
      {rideDetails && rideDetails.status !== 'completed' && (
        <button 
          onClick={getDriverLocation} 
          className="w-full p-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition duration-300 ease-in-out"
          disabled={isLoading}
        >
          {isLoading ? 'Fetching...' : 'Get Driver Location'}
        </button>
      )}
    </div>
  );
};

export default TrackingComponent;
