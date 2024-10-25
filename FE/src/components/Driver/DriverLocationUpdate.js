import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_KEY = 'AlzaSyXa6xL9GDqbdy0Ks2avv6N-eaz0OgR1krF'; // Replace with your actual API key
const BACKEND_URL = 'https://dhavalrupapara.me';
const driverId = localStorage.getItem('userId');

const DriverLocationUpdate = () => {
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const autocompleteRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCurrentJobs();
      loadGoogleMapsScript();
    }
  }, [user]);

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

  const loadGoogleMapsScript = () => {
    const script = document.createElement('script');
    script.src = `https://maps.gomaps.pro/maps/api/js?key=${API_KEY}&libraries=places`;
    script.async = true;
    script.onload = initAutocomplete;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
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

        // Alert the coordinates
        alert(`Selected Location Coordinates:\nLatitude: ${lat}\nLongitude: ${lng}`);
    }
};



  
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!location || !user) return;

  try {
    const response = await fetch(`${BACKEND_URL}/api/v2/drivers/update-location/${driverId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        latitude: location.lat,
        longitude: location.lng
      })
    });

    if (!response.ok) throw new Error('Failed to update location');

    const data = await response.json();
    alert('Location updated successfully!');
    navigate('/driver/dashboard');
  } catch (error) {
    console.error('Error updating location:', error);
    alert('Failed to update location. Please try again.');
  }
};
if (!user) return <div>Please log in to update your location.</div>;
if (loading) return <div>Loading...</div>;
if (error) return <div>Error: {error}</div>;

  

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Update Your Location</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="booking-select" className="block mb-2">Select Booking:</label>
          <select
            id="booking-select"
            value={selectedBooking}
            onChange={(e) => setSelectedBooking(e.target.value)}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select a booking</option>
            {bookings.map((booking) => (
              <option key={booking._id} value={booking._id}>
                {booking._id} - {booking.pickup.address} to {booking.dropoff.address}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="location-input" className="block mb-2">Current Location:</label>
          <input
            id="location-input"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter your current location"
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button 
          type="submit" 
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-200"
          disabled={!location || !selectedBooking}
        >
          Update Location
        </button>
      </form>
    </div>
  );
};

export default DriverLocationUpdate;