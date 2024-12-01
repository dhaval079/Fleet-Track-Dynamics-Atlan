import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { MapPin } from 'lucide-react';

const GOOGLE_MAPS_API_KEY = 'AlzaSy3h_O_Xdl_y_uwhT5NDv3xwYzVvmgbvXvu'; // Replace with actual API key
const BACKEND_URL = "https://fleet-track-dynamics-atlan.onrender.com";

const mapScriptUrl = `https://maps.gomaps.pro/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,directions`;


const BookingComponent = () => {
  // Refs
  const mapRef = useRef(null);
  const originInputRef = useRef(null);
  const destinationInputRef = useRef(null);

  // Map related state
  const [mapInstance, setMapInstance] = useState(null);
  const [directionsService, setDirectionsService] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);

  // Booking related state
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [userPrice, setUserPrice] = useState('');
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [matchedDriver, setMatchedDriver] = useState(null);
  const [bookingId, setBookingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);
  const [selectionMode, setSelectionMode] = useState('manual');
  const [isScheduleFuture, setIsScheduleFuture] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  // Helper Functions
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const showError = (message) => {
    setError(message);
    if (message === "Invalid vehicle or vehicle does not belong to the driver") {
      alert("Select a different driver or vehicle, the selected vehicle does not belong to the driver");
    } else {
      alert(message);
    }
  };

  // Google Maps Related Functions
 // Add this function at the beginning of your component, before any other functions
// Google Maps Related Functions
const loadGoogleMapsScript = () => {
  return new Promise((resolve, reject) => {
    if (typeof window.google !== 'undefined') {
      resolve();
      return;
    }

    const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.src = mapScriptUrl;
    script.async = true;
    script.defer = true;

    script.addEventListener('load', () => {
      setTimeout(resolve, 100);
    });

    script.addEventListener('error', () => {
      reject(new Error('Failed to load Google Maps script'));
    });

    document.head.appendChild(script);
  });
};

const initializeMap = async () => {
  try {
    if (!mapRef.current) return;

    let userLocation = { lat: 40.7128, lng: -74.0060 }; // Default to New York

    // Request user location
    await new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(userLocation);
          resolve();
        },
        (error) => {
          console.error('Location permission denied:', error);
          resolve(); // Continue with the default location if permission is denied
        }
      );
    });

    const map = new window.google.maps.Map(mapRef.current, {
      center: userLocation,
      zoom: 12,
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
      zoomControl: true
    });

    const directionsServiceInstance = new window.google.maps.DirectionsService();
    const directionsRendererInstance = new window.google.maps.DirectionsRenderer({
      map,
      suppressMarkers: false,
      preserveViewport: false
    });

    setMapInstance(map);
    setDirectionsService(directionsServiceInstance);
    setDirectionsRenderer(directionsRendererInstance);

    const originAutocomplete = new window.google.maps.places.Autocomplete(originInputRef.current, { types: ['address'] });
    const destinationAutocomplete = new window.google.maps.places.Autocomplete(destinationInputRef.current, { types: ['address'] });

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
  } catch (error) {
    console.error('Error initializing map:', error);
    setError('Failed to initialize map. Please refresh the page.');
  }
};

// Replace your existing calculateRoute function with this one
const calculateRoute = () => {
  if (!directionsService || !directionsRenderer) {
    setError('Map services not initialized. Please try again.');
    return;
  }

  setIsLoading(true);
  setError(null);

  const origin = originInputRef.current?.value;
  const destination = destinationInputRef.current?.value;

  if (!origin || !destination || !selectedVehicle) {
    setError("Please enter origin, destination, and select a vehicle");
    setIsLoading(false);
    return;
  }

  const request = {
    origin: originInputRef.current.coordinates || origin,
    destination: destinationInputRef.current.coordinates || destination,
    travelMode: window.google.maps.TravelMode.DRIVING,
    optimizeWaypoints: true,
    provideRouteAlternatives: false,
    avoidHighways: false,
    avoidTolls: false
  };

  directionsService.route(request)
    .then(result => {
      directionsRenderer.setDirections(result);
      const route = result.routes[0];
      setDistance(route.legs[0].distance.text);
      setDuration(route.legs[0].duration.text);
      estimatePrice(route.legs[0].distance.value / 1000);
      setIsLoading(false);
    })
    .catch(error => {
      console.error('Direction Service Error:', error);
      setError("Couldn't calculate route. Please verify the addresses and try again.");
      setIsLoading(false);
    });
};

  const initializeAutocomplete = () => {
    try {
      if (!window.google || !originInputRef.current || !destinationInputRef.current) return;

      const originAutocomplete = new window.google.maps.places.Autocomplete(originInputRef.current);
      const destinationAutocomplete = new window.google.maps.places.Autocomplete(destinationInputRef.current);

      originAutocomplete.addListener('place_changed', () => {
        const place = originAutocomplete.getPlace();
        if (place.geometry) {
          originInputRef.current.coordinates = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          };
          console.log(originInputRef.current.coordinates)
        }
      });

      destinationAutocomplete.addListener('place_changed', () => {
        const place = destinationAutocomplete.getPlace();
        if (place.geometry) {
          destinationInputRef.current.coordinates = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          };
          console.log(destinationInputRef.current.coordinates)

        }
      });
    } catch (err) {
      setError('Error initializing autocomplete: ' + err.message);
    }
  };

  const updateMarkerPosition = (location) => {
    if (mapInstance && location) {
      const latLng = new window.google.maps.LatLng(location.lat, location.lng);

      if (!mapRef.current.marker) {
        mapRef.current.marker = new window.google.maps.Marker({
          map: mapInstance,
          position: latLng
        });
      } else {
        mapRef.current.marker.setPosition(latLng);
      }

      mapInstance.panTo(latLng);
    }
  };

  // Socket Related Functions
  const initializeSocket = () => {
    const newSocket = io(BACKEND_URL, {
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

  // API Calls
  const fetchVehicles = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v2/vehicles`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
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
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
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

  // Price Related Functions
  const getPricePerKm = (vehicleType) => {
    const prices = {
      sedan: 0.5,
      suv: 0.7,
      van: 0.8,
      truck: 0.9
    };
    return prices[vehicleType] || 0.5;
  };

  const estimatePrice = (distance) => {
    const selectedVehicleObj = vehicles.find(v => v._id === selectedVehicle);
    const basePrice = 5;
    const pricePerKm = selectedVehicleObj ? getPricePerKm(selectedVehicleObj.vehicleType) : 0.5;
    const price = basePrice + (distance * pricePerKm);
    setEstimatedPrice(price.toFixed(2));
    setUserPrice(price.toFixed(2));
  };


  // Update your useEffect to use the new async loading approach
  useEffect(() => {
    const initializeMaps = async () => {
      try {
        await loadGoogleMapsScript();
        await initializeMap();
        setIsMapLoaded(true);
      } catch (error) {
        console.error("Error loading maps:", error);
        setError("Failed to load Google Maps. Please refresh the page.");
      }
    };

    initializeMaps();
    initializeSocket();
    fetchVehicles();
    fetchDrivers();
    setScheduleDate(getTomorrowDate());
  
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  // Driver Matching
  const findMatchingDriver = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!originInputRef.current?.coordinates) {
        throw new Error('Please select a valid origin from the dropdown');
      }

      const response = await fetch(`${BACKEND_URL}/api/v2/bookings/match`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
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

  // Booking Creation
  const bookRide = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Validation checks
      if (!originInputRef.current?.value || !destinationInputRef.current?.value) {
        throw new Error("Please enter both pickup and drop-off locations");
      }

      if (!selectedVehicle) {
        throw new Error("Please select a vehicle");
      }

      if (selectionMode === 'manual' && !selectedDriver) {
        throw new Error("Please select a driver");
      }

      if (selectionMode === 'automated' && !matchedDriver) {
        throw new Error("Please find a matching driver first");
      }

      if (!originInputRef.current?.coordinates || !destinationInputRef.current?.coordinates) {
        throw new Error("Please select valid locations from the dropdown suggestions");
      }

      const finalPrice = parseFloat(userPrice);
      if (isNaN(finalPrice) || finalPrice < parseFloat(estimatedPrice)) {
        throw new Error("Please enter a valid price (must be greater than or equal to the estimated price)");
      }

      // Schedule validation
      if (isScheduleFuture) {
        if (!scheduleDate || !scheduleTime) {
          throw new Error("Please select both date and time for future booking");
        }

        const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
        if (scheduledDateTime <= new Date()) {
          throw new Error("Scheduled time must be in the future");
        }
      }

      const bookingData = {
        userId: localStorage.getItem('userId'),
        driverId: selectionMode === 'manual' ? selectedDriver : matchedDriver._id,
        vehicleId: selectedVehicle,
        pickup: {
          address: originInputRef.current.value,
          coordinates: originInputRef.current.coordinates
        },
        dropoff: {
          address: destinationInputRef.current.value,
          coordinates: destinationInputRef.current.coordinates
        },
        price: finalPrice
      };

      if (isScheduleFuture) {
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
        body: JSON.stringify(bookingData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Booking failed');
      }

      if (data.success) {
        setError(null);
        alert(`Ride ${isScheduleFuture ? 'scheduled' : 'booked'} successfully! Booking ID: ${data.booking._id}`);
        setBookingId(data.booking._id);
      } else {
        throw new Error(data.message || 'Booking failed');
      }
    } catch (error) {
      const errorMessage = error.message || `Failed to ${isScheduleFuture ? 'schedule' : 'book'} ride`;
      showError(errorMessage);
      console.error('Booking error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    loadGoogleMapsScript();
    initializeSocket();
    fetchVehicles();
    fetchDrivers();
    setScheduleDate(getTomorrowDate());

    return () => {
      if (socket) {
        socket.disconnect();
      }
      const script = document.querySelector(`script[src*="maps.gomaps.pro/maps/api"]`);
      if (script) {
        script.remove();
      }
    };
  }, []);
  
 return (
   <div className="min-h-screen bg-gray-50">
      <div className="w-full h-screen flex">
        {/* Left Panel */}
        <div className="w-[450px] h-full bg-white shadow-lg z-10 flex flex-col">
          {/* Header */}
          <div className="flex items-center space-x-3 p-6 border-b">
            <h1 className="text-xl font-bold text-gray-900">Book a Ride</h1>
          </div>

          <div className="p-6 flex-1 overflow-y-auto space-y-6">
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
    className="w-full py-3 px-4 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
    disabled={isLoading}
  >
    {isLoading ? 'Finding Driver...' : 'Find Matching Driver'}
  </button>
)}

{/* Show matched driver info when available */}
{selectionMode === 'automated' && matchedDriver && (
  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
    <h3 className="font-semibold text-gray-900 mb-2">Matched Driver</h3>
    <div className="space-y-2">
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
