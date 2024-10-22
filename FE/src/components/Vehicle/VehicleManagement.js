import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Car, Truck, Calendar, Hexagon, Cpu, Palette } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BACKEND_URL = 'https://fleet-track-dynamics-atlan.onrender.com';
const driverId = localStorage.getItem('userId');

const VehicleManagement = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  
  useEffect(() => {
    if (user) {
      fetchVehicles();
    }
  }, [user]);

  const fetchVehicles = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v2/vehicles/driver/${driverId}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch vehicles');
      const data = await response.json();
      setVehicles(data.vehicles);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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

  if (!user) return <div>Please log in to view your vehicles.</div>;
  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;
  if (error) return <div className="text-red-500 text-center">Error: {error}</div>;


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
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${vehicle.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {vehicle.isAvailable ? 'Available' : 'In Use'}
                </span>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">{vehicle.make} {vehicle.model}</h2>
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