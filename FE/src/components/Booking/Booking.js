import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { io } from 'socket.io-client';
import DatePicker from 'react-datepicker'; // You'll need to install this package
import "react-datepicker/dist/react-datepicker.css";

const API_KEY = 'AlzaSy4STdH82R8gHqMhU-oldo3-trDZJZKBWBV'; // Replace with your actual API key

const BookingComponent = () => {
  const mapRef = useRef(null);
  const originInputRef = useRef(null);
  const destinationInputRef = useRef(null);

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
  const [selectionMode, setSelectionMode] = useState('manual'); // 'manual' or 'automated'
  const [isScheduleFuture, setIsScheduleFuture] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');


  useEffect(() => {
    loadGoogleMapsScript();
    initializeSocket();
    fetchVehicles();
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
    const newSocket = io('http://43.204.234.64:3001', {
      query: { token: localStorage.getItem('token') }
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
      const response = await fetch('http://43.204.234.64:3001/api/v2/vehicles', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
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
      const response = await fetch('http://43.204.234.64:3001/api/v2/drivers', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch drivers');
      }

      const data = await response.json();
      setDrivers(data.drivers);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      setError('Failed to load drivers. Please try again.');
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
      if (!originInputRef.current.coordinates) {
        throw new Error('Please select a valid origin from the dropdown');
      }

      const response = await fetch('http://43.204.234.64:3001/api/v2/bookings/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId: localStorage.getItem('userId'),
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
  
      const endpoint = isScheduleFuture ? 'http://43.204.234.64:3001/api/v2/bookings/future' : 'http://43.204.234.64:3001/api/v2/bookings';
  
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
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
    <div className="flex h-screen bg-gray-100">
      <div className="w-1/3 p-6 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6">Book a Ride</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        
        <select 
          value={selectedVehicle} 
          onChange={(e) => setSelectedVehicle(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        >
          <option value="">Select a vehicle</option>
          {vehicles.map(vehicle => (
            <option key={vehicle._id} value={vehicle._id}>{vehicle.make} {vehicle.model} ({vehicle.vehicleType})</option>
          ))}
        </select>

        <input ref={originInputRef} type="text" placeholder="Enter origin" className="w-full p-2 mb-4 border rounded" />
        <input ref={destinationInputRef} type="text" placeholder="Enter destination" className="w-full p-2 mb-4 border rounded" />
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={calculateRoute}
          className="w-full p-2 mb-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300"
          disabled={isLoading}
        >
          {isLoading ? 'Calculating...' : 'Calculate Route'}
        </motion.button>
        
        {distance && duration && (
          <div className="mb-4">
            <p className="font-semibold">Distance: {distance}</p>
            <p className="font-semibold">Duration: {duration}</p>
            <p className="font-semibold">Estimated Price: ${estimatedPrice}</p>
            <input
              type="number"
              value={userPrice}
              onChange={(e) => setUserPrice(e.target.value)}
              min={estimatedPrice}
              step="0.01"
              className="w-full p-2 mt-2 border rounded"
              placeholder="Enter price (must be >= estimated price)"
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block mb-2">Selection Mode:</label>
          <div className="flex justify-between">
            <button
              onClick={() => { setSelectionMode('manual'); fetchDrivers(); }}
              className={`w-1/2 p-2 ${selectionMode === 'manual' ? 'bg-blue-500 text-white' : 'bg-gray-200'} rounded-l`}
            >
              Manual
            </button>
            <button
              onClick={() => setSelectionMode('automated')}
              className={`w-1/2 p-2 ${selectionMode === 'automated' ? 'bg-blue-500 text-white' : 'bg-gray-200'} rounded-r`}
            >
              Automated
            </button>
          </div>
        </div>

        {selectionMode === 'manual' && (
          <select 
            value={selectedDriver} 
            onChange={(e) => setSelectedDriver(e.target.value)}
            className="w-full p-2 mb-4 border rounded"
          >
            <option value="">Select a driver</option>
            {drivers.map(driver => (
              <option key={driver._id} value={driver._id}>{driver.username}</option>
            ))}
          </select>
        )}

        {selectionMode === 'automated' && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={findMatchingDriver}
            className="w-full p-2 mb-4 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300"
            disabled={isLoading}
          >
            {isLoading ? 'Finding Driver...' : 'Find Matching Driver'}
          </motion.button>
        )}

        {selectionMode === 'automated' && matchedDriver && (
          <div className="mb-4 p-4 bg-blue-100 rounded">
            <h2 className="font-bold text-lg mb-2">Matched Driver</h2>
            <p>Name: {matchedDriver.username}</p>
            <p>Location: {matchedDriver.currentLocation.coordinates[1]}, {matchedDriver.currentLocation.coordinates[0]}</p>
          </div>
        )}

       
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isScheduleFuture}
              onChange={(e) => setIsScheduleFuture(e.target.checked)}
              className="mr-2"
            />
            Schedule for later
          </label>
        </div>
        
        {isScheduleFuture && (
          <div className="mb-4">
            <input
              type="date"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              min={getTomorrowDate()} // Prevent selecting dates before tomorrow
              className="w-full p-2 mb-2 border rounded"
            />
            <input
              type="time"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={bookRide}
          className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300"
          disabled={isLoading || (selectionMode === 'automated' && !matchedDriver) || !selectedVehicle}
        >
          {isLoading ? 'Booking...' : isScheduleFuture ? 'Schedule Ride' : 'Book Now'}
        </motion.button>

      </div>
      <div className="w-2/3" ref={mapRef}></div>
    </div>
  );
};

export default BookingComponent;