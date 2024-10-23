import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { io } from 'socket.io-client';
import DatePicker from 'react-datepicker'; // You'll need to install this package
import "react-datepicker/dist/react-datepicker.css";
import { apiCall } from '../../utils/api';
import { useAuth } from '../context/AuthContext';

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
        <Card className="w-[450px] h-full rounded-none p-6 bg-white shadow-lg z-10 flex flex-col">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
              <Car className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">RideStream</h1>
          </div>

          {/* Location Inputs */}
          <div className="relative mb-8">
            <div className="absolute left-4 top-4 bottom-4 flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <div className="w-0.5 h-full bg-gray-200 my-2" />
              <div className="w-3 h-3 rounded-full bg-red-500" />
            </div>
            
            <div className="space-y-2">
              <div className="relative">
                <input
                  ref={originInputRef}
                  type="text"
                  placeholder="Enter pickup location"
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <Crosshair className="absolute right-4 top-4 text-gray-400 w-5 h-5" />
              </div>
              <div className="relative">
                <input
                  ref={destinationInputRef}
                  type="text"
                  placeholder="Enter destination"
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <Search className="absolute right-4 top-4 text-gray-400 w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Vehicle Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Vehicle</h3>
            <div className="space-y-3">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle._id}
                  onClick={() => setSelectedVehicle(vehicle._id)}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    selectedVehicle === vehicle._id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex space-x-4">
                      <Car className={`w-6 h-6 ${selectedVehicle === vehicle._id ? 'text-blue-500' : 'text-gray-500'}`} />
                      <div>
                        <h4 className="font-medium text-gray-900">{`${vehicle.make} ${vehicle.model}`}</h4>
                        <p className="text-sm text-gray-500">{vehicle.vehicleType}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selection Mode */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Selection Mode</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSelectionMode('manual')}
                className={`py-3 px-4 rounded-xl font-medium transition-colors ${
                  selectionMode === 'manual'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Manual
              </button>
              <button
                onClick={() => setSelectionMode('automated')}
                className={`py-3 px-4 rounded-xl font-medium transition-colors ${
                  selectionMode === 'automated'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Automated
              </button>
            </div>
          </div>

          {/* Driver Selection (Manual Mode) */}
          {selectionMode === 'manual' && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Driver</h3>
              <select
                value={selectedDriver}
                onChange={(e) => setSelectedDriver(e.target.value)}
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Choose a driver</option>
                {drivers.map(driver => (
                  <option key={driver._id} value={driver._id}>{driver.username}</option>
                ))}
              </select>
            </div>
          )}

          {/* Schedule Options */}
          <div className="mb-6">
            <label className="flex items-center space-x-2 mb-4">
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
                  className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            )}
          </div>

          {/* Route Details */}
          {distance && duration && (
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <div className="space-y-2">
                <p className="flex justify-between">
                  <span className="text-gray-600">Distance:</span>
                  <span className="font-medium text-gray-900">{distance}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium text-gray-900">{duration}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Estimated Price:</span>
                  <span className="font-medium text-gray-900">${estimatedPrice}</span>
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-auto space-y-4">
            <button
              onClick={calculateRoute}
              className="w-full py-4 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled={isLoading || !selectedVehicle}
            >
              Calculate Route
            </button>

            <button
              onClick={bookRide}
              className="w-full py-4 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled={isLoading || (selectionMode === 'automated' && !matchedDriver) || !selectedVehicle}
            >
              {isLoading ? 'Processing...' : isScheduleFuture ? 'Schedule Ride' : 'Book Now'}
            </button>
          </div>
        </Card>

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
