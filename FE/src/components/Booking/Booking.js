import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { io } from 'socket.io-client';
import DatePicker from 'react-datepicker'; // You'll need to install this package
import "react-datepicker/dist/react-datepicker.css";
import { apiCall } from '../../utils/api';
import { useAuth } from '../context/AuthContext';
import { MapPin, Car, Clock, Users, ChevronDown, Search, Crosshair, ZoomIn, ZoomOut, Calendar } from 'lucide-react';

const API_KEY = 'AlzaSy4STdH82R8gHqMhU-oldo3-trDZJZKBWBV'; // Replace with your actual API key
const BACKEND_URL = 'https://fleet-track-dynamics-atlan.onrender.com';


const BookingComponent = () => {
  const mapRef = useRef(null);
  const originInputRef = useRef(null);
  const destinationInputRef = useRef(null);

  const { user } = useAuth();
  const [map, setMap] = useState(null);
  const [directionsService, setDirectionsService] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userPrice, setUserPrice] = useState('');
  const [bookingId, setBookingId] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [socket, setSocket] = useState(null);
  const [error, setError] = useState(null);
  const [matchedDriver, setMatchedDriver] = useState(null);
  const [selectionMode, setSelectionMode] = useState('manual');
  const [isScheduleFuture, setIsScheduleFuture] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');


  useEffect(() => {
    loadGoogleMapsScript();
    initializeSocket();
    fetchVehicles();
    fetchDrivers(); // Make sure this is called
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const loadGoogleMapsScript = () => {
    const script = document.createElement('script');
    script.src = `https://maps.gomaps.pro/maps/api/js?key=${API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = initMap;
    document.head.appendChild(script);
  };
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };
  useEffect(() => {
    setScheduleDate(getTomorrowDate());
  }, []);

  const initMap = () => {
    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: { lat: 40.7128, lng: -74.0060 }, // New York coordinates
      zoom: 13
    });

    const directionsServiceInstance = new window.google.maps.DirectionsService();
    const directionsRendererInstance = new window.google.maps.DirectionsRenderer();

    directionsRendererInstance.setMap(mapInstance);

    setMap(mapInstance);
    setDirectionsService(directionsServiceInstance);
    setDirectionsRenderer(directionsRendererInstance);

    const originAutocomplete = new window.google.maps.places.Autocomplete(originInputRef.current);
    const destinationAutocomplete = new window.google.maps.places.Autocomplete(destinationInputRef.current);

    originAutocomplete.addListener('place_changed', () => {
      const place = originAutocomplete.getPlace();
      if (place.geometry) {
        originInputRef.current.coordinates = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
      }
    });

    destinationAutocomplete.addListener('place_changed', () => {
      const place = destinationAutocomplete.getPlace();
      if (place.geometry) {
        destinationInputRef.current.coordinates = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
      }
    });
  };

  const initializeSocket = () => {
    const newSocket = io('https://fleet-track-dynamics-atlan.onrender.com', {
      query: { token: localStorage.getItem('token') }
      // withCredentials: true
    });
    
    setSocket(newSocket);

    newSocket.on('locationUpdate', (location) => {
      setCurrentLocation(location);
      updateMarkerPosition(location);
    });

    newSocket.on('rideCompleted', () => {
      alert('Your ride has been completed!');
      setBookingId(null);
    });
  };

  const fetchVehicles = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v2/vehicles`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`,
        // 
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch vehicles');
      }

      const data = await response.json();
      setVehicles(data.vehicles);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setError('Failed to load vehicles. Please try again.');
    }
  };

  const fetchDrivers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/v2/drivers`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`}
        // credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch drivers');
      }

      const data = await response.json();
      setDrivers(data.drivers);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      setError('Failed to load drivers. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateRoute = () => {
    setIsLoading(true);
    setError(null);
    const origin = originInputRef.current.value;
    const destination = destinationInputRef.current.value;

    if (!origin || !destination || !selectedVehicle) {
      setError("Please enter origin, destination, and select a vehicle");
      setIsLoading(false);
      return;
    }

    const request = {
      origin: origin,
      destination: destination,
      travelMode: 'DRIVING'
    };

    directionsService.route(request, (result, status) => {
      if (status === 'OK') {
        directionsRenderer.setDirections(result);
        const route = result.routes[0];
        setDistance(route.legs[0].distance.text);
        setDuration(route.legs[0].duration.text);
        estimatePrice(route.legs[0].distance.value / 1000);
      } else {
        setError("Couldn't calculate route. Please try again.");
      }
      setIsLoading(false);
    });
  };

  const estimatePrice = (distance) => {
    const selectedVehicleObj = vehicles.find(v => v._id === selectedVehicle);
    const basePrice = 5;
    const pricePerKm = selectedVehicleObj ? getPricePerKm(selectedVehicleObj.vehicleType) : 0.5;
    const price = basePrice + (distance * pricePerKm);
    setEstimatedPrice(price.toFixed(2));
    setUserPrice(price.toFixed(2));
  };

  const getPricePerKm = (vehicleType) => {
    switch (vehicleType) {
      case 'sedan': return 0.5;
      case 'suv': return 0.7;
      case 'van': return 0.8;
      case 'truck': return 0.9;
      default: return 0.5;
    }
  };

  const findMatchingDriver = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }
      if (!originInputRef.current.coordinates) {
        throw new Error('Please select a valid origin from the dropdown');
      }

      const response = await fetch(`${BACKEND_URL}/api/v2/bookings/match`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        
        body: JSON.stringify({
          userId: localStorage.getItem('userId'), // Use the id from the authenticated user object
          pickup: {
            address: originInputRef.current.value,
            coordinates: originInputRef.current.coordinates
          },
          vehicleId: selectedVehicle
        }),
      });

      if (!response.ok) {
        throw new Error('Matching failed');
      }

      const data = await response.json();
      if (data.success) {
        setMatchedDriver(data.driver);
        setSelectedDriver(data.driver._id);
        alert("Driver matched successfully!");
      } else {
        throw new Error(data.message || 'Matching failed');
      }
    } catch (error) {
      setError("Failed to find matching driver: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const bookRide = async () => {
    setIsLoading(true);
    setError(null);
    const origin = originInputRef.current.value;
    const destination = destinationInputRef.current.value;

    if (!origin || !destination || !selectedVehicle || (!selectedDriver && selectionMode === 'manual') || (!matchedDriver && selectionMode === 'automated')) {
      setError("Please fill in all required fields");
      setIsLoading(false);
      return;
    }

    if (!originInputRef.current.coordinates || !destinationInputRef.current.coordinates) {
      setError("Please select valid locations for both origin and destination");
      setIsLoading(false);
      return;
    }

    const finalPrice = parseFloat(userPrice);
    if (isNaN(finalPrice) || finalPrice < parseFloat(estimatedPrice)) {
      setError("Please enter a valid price (must be >= estimated price).");
      setIsLoading(false);
      return;
    }

    try {
      const bookingData = {
        userId: localStorage.getItem('userId'),
        driverId: selectionMode === 'manual' ? selectedDriver : matchedDriver._id,
        vehicleId: selectedVehicle,
        pickup: {
          address: origin,
          coordinates: originInputRef.current.coordinates
        },
        dropoff: {
          address: destination,
          coordinates: destinationInputRef.current.coordinates
        },
        price: finalPrice
      };

      if (isScheduleFuture) {
        if (!scheduleDate || !scheduleTime) {
          setError("Please select both date and time for future booking.");
          setIsLoading(false);
          return;
        }
        const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
        bookingData.scheduledTime = scheduledDateTime.toISOString();
      }

      const endpoint = isScheduleFuture ? '/api/v2/bookings/future' : '/api/v2/bookings';

      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        // 
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Booking failed');
      }

      const data = await response.json();
      if (data.success) {
        alert(`Ride ${isScheduleFuture ? 'scheduled' : 'booked'} successfully! Booking ID: ${data.booking._id}`);
        setBookingId(data.booking._id);
      } else {
        throw new Error(data.message || 'Booking failed');
      }
    } catch (error) {
      setError(`Failed to ${isScheduleFuture ? 'schedule' : 'book'} ride: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };



  const updateMarkerPosition = (location) => {
    if (map && location) {
      const latLng = new window.google.maps.LatLng(location.lat, location.lng);

      if (!mapRef.current.marker) {
        mapRef.current.marker = new window.google.maps.Marker({
          map: map,
          position: latLng
        });
      } else {
        mapRef.current.marker.setPosition(latLng);
      }

      map.panTo(latLng);
    }
  };

 return (
   <div className="min-h-screen bg-gray-50">
      <div className="w-full h-screen flex">
        {/* Left Panel */}
        <div className="w-[450px] h-full bg-white shadow-lg z-10 flex flex-col">
          {/* Header */}
          <div className="flex items-center space-x-3 p-6 border-b">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
              <Car className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">RideStream</h1>
          </div>

          <div className="p-6 flex-1 overflow-y-auto space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Book a Ride</h2>

            {/* Location Inputs */}
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute left-4 top-3">
                  <MapPin className="w-5 h-5 text-blue-500" />
                </div>
                <input
                  ref={originInputRef}
                  type="text"
                  placeholder="Enter origin"
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="relative">
                <div className="absolute left-4 top-3">
                  <MapPin className="w-5 h-5 text-red-500" />
                </div>
                <input
                  ref={destinationInputRef}
                  type="text"
                  placeholder="Enter destination"
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Vehicle Selection Dropdown */}
            <div>
              <select
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white"
              >
                <option value="">Select a vehicle</option>
                {vehicles.map(vehicle => (
                  <option key={vehicle._id} value={vehicle._id}>
                    {vehicle.make} {vehicle.model} ({vehicle.vehicleType})
                  </option>
                ))}
              </select>
            </div>

            {/* Calculate Route Button */}
            <button
              onClick={calculateRoute}
              className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? 'Calculating...' : 'Calculate Route'}
            </button>

            {/* Route Details */}
            {distance && duration && (
              <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-gray-600">Distance:</span>
                  <span className="font-medium">{distance}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Price:</span>
                  <span className="font-medium">${estimatedPrice}</span>
                </div>
                <input
                  type="number"
                  value={userPrice}
                  onChange={(e) => setUserPrice(e.target.value)}
                  className="w-full mt-2 p-3 rounded-lg border border-gray-200"
                  placeholder="Enter price (must be >= estimated price)"
                />
              </div>
            )}

            {/* Selection Mode Toggle */}
            <div className="space-y-2">
              <label className="text-gray-700 font-medium">Selection Mode:</label>
              <div className="grid grid-cols-2 gap-2 w-full">
                <button
                  onClick={() => setSelectionMode('manual')}
                  className={`p-3 rounded-lg font-medium transition-colors ${
                    selectionMode === 'manual'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Manual
                </button>
                <button
                  onClick={() => setSelectionMode('automated')}
                  className={`p-3 rounded-lg font-medium transition-colors ${
                    selectionMode === 'automated'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Automated
                </button>
              </div>
            </div>

            {/* Driver Selection or Find Driver */}
            {selectionMode === 'manual' ? (
              <select
                value={selectedDriver}
                onChange={(e) => setSelectedDriver(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select a driver</option>
                {drivers.map(driver => (
                  <option key={driver._id} value={driver._id}>{driver.username}</option>
                ))}
              </select>
            ) : (
              <button
                onClick={findMatchingDriver}
                className="w-full py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'Finding Driver...' : 'Find Matching Driver'}
              </button>
            )}

{selectionMode === 'automated' && (
  <>
    <button
      onClick={findMatchingDriver}
      className="w-full py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
      disabled={isLoading}
    >
      {isLoading ? 'Finding Driver...' : 'Find Matching Driver'}
    </button>

    {/* Matched Driver Display */}
    {matchedDriver && (
      <div className="mt-4 bg-blue-50 rounded-lg p-4 border border-blue-100">
        <h3 className="font-semibold text-gray-900 mb-2">Matched Driver</h3>
        <div className="space-y-1">
          <p className="text-gray-700">
            <span className="font-medium">Name:</span> {matchedDriver.username}
          </p>
          <p className="text-gray-700">
            <span className="font-medium">Location:</span>{' '}
            {matchedDriver.currentLocation.coordinates[1]}, {matchedDriver.currentLocation.coordinates[0]}
          </p>
        </div>
      </div>
    )}
  </>
)}

            {/* Schedule Checkbox */}
            <div className="space-y-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isScheduleFuture}
                  onChange={(e) => setIsScheduleFuture(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-500"
                />
                <span className="text-gray-700">Schedule for later</span>
              </label>

              {isScheduleFuture && (
                <div className="space-y-2">
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    min={getTomorrowDate()}
                    className="w-full p-3 rounded-lg border border-gray-200"
                  />
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full p-3 rounded-lg border border-gray-200"
                  />
                </div>
              )}
            </div>

            {/* Book Now Button */}
            <button
              onClick={bookRide}
              className="w-full py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
              disabled={isLoading || (selectionMode === 'automated' && !matchedDriver) || !selectedVehicle}
            >
              {isLoading ? 'Processing...' : isScheduleFuture ? 'Schedule Ride' : 'Book Now'}
            </button>
          </div>
        </div>

        {/* Map Section */}
        <div className="flex-1">
          <div className="h-full relative" ref={mapRef}>
            {/* Map controls will be rendered here by Google Maps */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingComponent;
