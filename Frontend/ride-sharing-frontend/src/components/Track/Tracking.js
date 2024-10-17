import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';

const TrackingComponent = () => {
  const [location, setLocation] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const socket = io('http://localhost:3001');
    
    socket.on('connect', () => {
      console.log('Connected to WebSocket');
      socket.emit('subscribe', id);
    });

    socket.on('locationUpdate', (newLocation) => {
      setLocation(newLocation);
    });

    return () => {
      socket.disconnect();
    };
  }, [id]);

  return (
    <div className="max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-5">Tracking Booking: {id}</h2>
      {location ? (
        <div>
          <p>Latitude: {location.lat}</p>
          <p>Longitude: {location.lng}</p>
        </div>
      ) : (
        <p>Waiting for location updates...</p>
      )}
    </div>
  );
};

export default TrackingComponent;