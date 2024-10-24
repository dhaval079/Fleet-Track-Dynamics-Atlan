import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Car, Truck, Calendar, Hexagon, Cpu, Palette } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BACKEND_URL = 'https://dhavalrupapara.me';

const VehicleManagement = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchVehicles = useCallback(async () => {
    const driverId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    if (!driverId || !token) {
      throw new Error('Authentication required');
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/v2/vehicles/driver/${driverId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired');
        }
        throw new Error('Failed to fetch vehicles');
      }

      const data = await response.json();
      if (data.success === false) {
        throw new Error(data.message || 'Failed to fetch vehicles');
      }

      setVehicles(data.vehicles);
      return true;
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      throw error;
    }
  }, []);

  const initializeData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await fetchVehicles();
    } catch (error) {
      console.error('Initialization error:', error);
      setError(error.message || 'Failed to load vehicles');
      return false;
    } finally {
      setLoading(false);
    }

    return true;
  }, [fetchVehicles]);

  useEffect(() => {
    if (user?.email && localStorage.getItem('token')) {
      initializeData();
    }
  }, [user?.email, initializeData]);

  const getVehicleIcon = (type) => {
    switch (type) {
      case 'sedan':
      case 'suv':
        return <Car className="w-8 h-8 text-blue-500" />;
      case 'van':
      case 'truck':
        return <Truck className="w-8 h-8 text-green-500" />;
      default:
        return <Car className="w-8 h-8 text-gray-500" />;
    }
  };

  if (!user?.email || !localStorage.getItem('token')) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500 text-xl">Please log in to view your vehicles</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="text-red-500 text-xl mb-4">{error}</div>
        <button 
          onClick={initializeData}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">My Vehicles</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((vehicle) => (
          <motion.div
            key={vehicle._id}
            className="bg-white rounded-lg shadow-lg overflow-hidden"
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                {getVehicleIcon(vehicle.vehicleType)}
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  vehicle.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {vehicle.isAvailable ? 'Available' : 'In Use'}
                </span>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                {vehicle.make} {vehicle.model}
              </h2>
              <div className="space-y-2">
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-5 h-5 mr-2" />
                  <span>{vehicle.year}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Hexagon className="w-5 h-5 mr-2" />
                  <span>{vehicle.licensePlate}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Cpu className="w-5 h-5 mr-2" />
                  <span className="capitalize">{vehicle.vehicleType}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Palette className="w-5 h-5 mr-2" />
                  <span>{vehicle.color}</span>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300">
                Manage Vehicle
              </button>
            </div>
          </motion.div>
        ))}
      </div>
      {vehicles.length === 0 && (
        <div className="text-center text-gray-500 mt-10">
          No vehicles found. Add a vehicle to get started.
        </div>
      )}
    </div>
  );
};

export default VehicleManagement;