import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { motion } from 'framer-motion';
import { User, Truck, Shield, ArrowRight } from 'lucide-react';

const API_KEY = 'AlzaSy4STdH82R8gHqMhU-oldo3-trDZJZKBWBV'; // Replace with your actual API key

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'customer',
    licenseNumber: '',
    experienceYears: '',
    phoneNumber: '',
    address: '',
  });
  const navigate = useNavigate();
  const { login } = useAuth();

  const testAccounts = [
    { role: 'Customer', email: 'rupaparadhaval1234@gmail.com', password: 'atlanbackend', icon: <User className="w-8 h-8" />, color: 'bg-blue-500' },
    { role: 'Driver', email: 'janesmith1@example.com', password: 'securepassword456', icon: <Truck className="w-8 h-8" />, color: 'bg-green-500' },
    { role: 'Admin', email: 'admin@example.com', password: 'adminpass123', icon: <Shield className="w-8 h-8" />, color: 'bg-purple-500' },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = `https://fleet-track-dynamics-atlan.onrender.com/api/v2/auth/${isLogin ? 'login' : 'signup'}`;
    try {
      let submitData = { ...formData };
      
      if (!isLogin && formData.role === 'driver') {
        const location = await geocodeAddress(formData.address);
        submitData.currentLocation = {
          type: 'Point',
          coordinates: [location.lng, location.lat]
        };
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('userId', data.user.id);        
        localStorage.setItem('email', data.user.email);        
        localStorage.setItem('Id', JSON.stringify(data.user.id));
        login(data.user);
        navigate('/');
      } else {
        alert(data.message || 'Authentication failed');
      }
    } catch (error) {
      console.error('Auth error:', error);
      alert('An error occurred during authentication');
    }
  };

  const geocodeAddress = async (address) => {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.gomaps.pro/maps/api/geocode/json?address=${encodedAddress}&key=${API_KEY}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return { lat: location.lat, lng: location.lng };
      } else {
        throw new Error('Geocoding failed');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      throw error;
    }
  };

  const handleTestLogin = (email, password) => {
    setFormData({ ...formData, email, password });
    handleSubmit({ preventDefault: () => {} });
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Welcome to Ride Sharing</h1>
      
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-center text-gray-700">Test Accounts</h2>
        <p className="text-center text-gray-600 mb-6">Use these accounts to explore different user roles</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testAccounts.map((account, index) => (
            <motion.div
              key={account.role}
              className={`${account.color} rounded-lg shadow-lg overflow-hidden`}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  {account.icon}
                  <h3 className="text-xl font-bold text-white">{account.role}</h3>
                </div>
                <p className="text-white mb-2">Email: {account.email}</p>
                <p className="text-white mb-4">Password: {account.password}</p>
                <button
                  onClick={() => handleTestLogin(account.email, account.password)}
                  className="w-full bg-white text-gray-800 font-bold py-2 px-4 rounded-full hover:bg-gray-100 transition duration-300 flex items-center justify-center"
                >
                  Login as {account.role}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-5 text-center">{isLogin ? 'Login' : 'Sign Up'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
          {!isLogin && (
            <>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              >
                <option value="customer">Customer</option>
                <option value="driver">Driver</option>
                <option value="admin">Admin</option>
              </select>
              <input
                type="tel"
                name="phoneNumber"
                placeholder="Phone Number"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
              {formData.role === 'driver' && (
                <>
                  <input
                    type="text"
                    name="licenseNumber"
                    placeholder="License Number"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                  <input
                    type="number"
                    name="experienceYears"
                    placeholder="Years of Experience"
                    value={formData.experienceYears}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </>
              )}
            </>
          )}
          <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300">
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>
        <p className="mt-4 text-center">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-blue-500 font-semibold hover:underline">
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;