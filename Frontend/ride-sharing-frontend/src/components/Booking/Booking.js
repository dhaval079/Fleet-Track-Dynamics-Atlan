import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Flex,
  HStack,
  VStack,
  Input,
  Text,
  Select,
  Checkbox,
  IconButton,
  useToast,
} from '@chakra-ui/react';
import { FaLocationArrow, FaTimes } from 'react-icons/fa';
import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  Autocomplete,
  DirectionsRenderer,
} from '@react-google-maps/api';

const center = { lat: 48.8584, lng: 2.2945 }; // Paris coordinates

const BookingComponent = () => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });

  const [map, setMap] = useState(/** @type google.maps.Map */ (null));
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState(0);

  const [bookingData, setBookingData] = useState({
    userId: '',
    driverId: '',
    vehicleId: '',
    pickup: { address: '', coordinates: { lat: 0, lng: 0 } },
    dropoff: { address: '', coordinates: { lat: 0, lng: 0 } },
    price: 0,
  });

  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [useCustomPrice, setUseCustomPrice] = useState(false);

  const originRef = useRef();
  const destinationRef = useRef();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.id) {
      setBookingData(prev => ({ ...prev, userId: user.id }));
      fetchDriversAndVehicles();
    } else {
      toast({
        title: 'User information not found',
        description: 'Please log in again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      navigate('/login');
    }
  }, [navigate, toast]);

  const fetchDriversAndVehicles = async () => {
    try {
      const [driversResponse, vehiclesResponse] = await Promise.all([
        fetch('http://localhost:3001/api/v2/drivers', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('http://localhost:3001/api/v2/vehicles', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      const driversData = await driversResponse.json();
      const vehiclesData = await vehiclesResponse.json();

      setDrivers(driversData.drivers);
      setVehicles(vehiclesData.vehicles);
    } catch (error) {
      console.error('Error fetching drivers and vehicles:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch necessary data. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) : value
    }));
  };

  const calculateRoute = async () => {
    if (originRef.current.value === '' || destinationRef.current.value === '') {
      return;
    }
    // eslint-disable-next-line no-undef
    const directionsService = new google.maps.DirectionsService();
    const results = await directionsService.route({
      origin: originRef.current.value,
      destination: destinationRef.current.value,
      // eslint-disable-next-line no-undef
      travelMode: google.maps.TravelMode.DRIVING,
    });
    setDirectionsResponse(results);
    setDistance(results.routes[0].legs[0].distance.text);
    setDuration(results.routes[0].legs[0].duration.text);

    setBookingData(prev => ({
      ...prev,
      pickup: {
        address: originRef.current.value,
        coordinates: results.routes[0].legs[0].start_location.toJSON(),
      },
      dropoff: {
        address: destinationRef.current.value,
        coordinates: results.routes[0].legs[0].end_location.toJSON(),
      },
    }));

    calculatePrice(results.routes[0].legs[0].distance.value / 1000); // Convert meters to kilometers
  };

  const calculatePrice = async (distance) => {
    const vehicle = vehicles.find(v => v._id === bookingData.vehicleId);
    if (!vehicle) return;

    try {
      const response = await fetch('http://localhost:3001/api/v2/bookings/estimate-price', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          distance,
          vehicleType: vehicle.vehicleType
        })
      });
      const data = await response.json();
      if (data.success) {
        setEstimatedPrice(data.estimatedPrice);
        setBookingData(prev => ({ ...prev, price: data.estimatedPrice }));
      }
    } catch (error) {
      console.error('Error estimating price:', error);
      toast({
        title: 'Error',
        description: 'Failed to estimate price. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const clearRoute = () => {
    setDirectionsResponse(null);
    setDistance('');
    setDuration('');
    setEstimatedPrice(0);
    originRef.current.value = '';
    destinationRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/api/v2/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(bookingData)
      });
      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Booking Created',
          description: 'Your ride has been booked successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        navigate(`/tracking/${data.booking._id}`);
      } else {
        toast({
          title: 'Booking Failed',
          description: data.message || 'Failed to create booking. Please try again.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while creating the booking. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (!isLoaded) {
    return <Text>Loading...</Text>;
  }

  return (
    <Flex position='relative' flexDirection='column' alignItems='center' h='100vh' w='100vw'>
      <Box position='absolute' left={0} top={0} h='100%' w='100%'>
        <GoogleMap
          center={center}
          zoom={15}
          mapContainerStyle={{ width: '100%', height: '100%' }}
          options={{
            zoomControl: false,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
          onLoad={map => setMap(map)}
        >
          <Marker position={center} />
          {directionsResponse && (
            <DirectionsRenderer directions={directionsResponse} />
          )}
        </GoogleMap>
      </Box>
      <Box
        p={4}
        borderRadius='lg'
        m={4}
        bgColor='white'
        shadow='base'
        minW='container.md'
        zIndex='1'
      >
        <VStack spacing={4} as='form' onSubmit={handleSubmit}>
          <HStack spacing={2} justifyContent='space-between' width='100%'>
            <Box flexGrow={1}>
              <Autocomplete>
                <Input type='text' placeholder='Origin' ref={originRef} />
              </Autocomplete>
            </Box>
            <Box flexGrow={1}>
              <Autocomplete>
                <Input type='text' placeholder='Destination' ref={destinationRef} />
              </Autocomplete>
            </Box>
            <Button colorScheme='pink' type='button' onClick={calculateRoute}>
              Calculate Route
            </Button>
          </HStack>
          <HStack spacing={4} justifyContent='space-between' width='100%'>
            <Text>Distance: {distance} </Text>
            <Text>Duration: {duration} </Text>
            <IconButton
              aria-label='center back'
              icon={<FaLocationArrow />}
              isRound
              onClick={() => {
                map.panTo(center);
                map.setZoom(15);
              }}
            />
          </HStack>
          <Select
            name="driverId"
            onChange={handleChange}
            placeholder="Select Driver"
            required
          >
            {drivers.map(driver => (
              <option key={driver._id} value={driver._id}>{driver.username}</option>
            ))}
          </Select>
          <Select
            name="vehicleId"
            onChange={handleChange}
            placeholder="Select Vehicle"
            required
          >
            {vehicles.map(vehicle => (
              <option key={vehicle._id} value={vehicle._id}>{vehicle.make} {vehicle.model}</option>
            ))}
          </Select>
          {estimatedPrice > 0 && (
            <Text fontSize="lg" fontWeight="bold">
              Estimated Price: ${estimatedPrice.toFixed(2)}
            </Text>
          )}
          <Checkbox
            isChecked={useCustomPrice}
            onChange={(e) => setUseCustomPrice(e.target.checked)}
          >
            Use custom price
          </Checkbox>
          {useCustomPrice && (
            <Input
              type="number"
              name="price"
              placeholder="Enter custom price"
              value={bookingData.price}
              onChange={handleChange}
              required
            />
          )}
          <Button colorScheme="blue" type="submit" width="100%">
            Book Now
          </Button>
        </VStack>
      </Box>
    </Flex>
  );
};

export default BookingComponent;