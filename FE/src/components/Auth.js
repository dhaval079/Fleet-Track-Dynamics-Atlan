import React, { useState } from 'react';
import { Shield, User, Truck, ArrowRight, Mail, Lock, Phone, MapPin, CreditCard, Clock } from 'lucide-react';

const BACKEND_URL = 'https://dhavalrupapara.me';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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

  const testAccounts = [
    { role: 'Customer', email: 'rupaparadhaval1234@gmail.com', password: 'atlanbackend', icon: <User size={24} />, gradient: 'from-blue-500 to-blue-600', hoverColor: 'hover:bg-blue-50', textColor: 'text-blue-600' },
    { role: 'Driver', email: 'janesmith1@example.com', password: 'securepassword456', icon: <Truck size={24} />, gradient: 'from-emerald-500 to-emerald-600', hoverColor: 'hover:bg-emerald-50', textColor: 'text-emerald-600' },
    { role: 'Admin', email: 'admin@example.com', password: 'adminpass123', icon: <Shield size={24} />, gradient: 'from-purple-500 to-purple-600', hoverColor: 'hover:bg-purple-50', textColor: 'text-purple-600' },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Implementation would match the original component
    setLoading(false);
  };

  const handleTestLogin = async (email, password) => {
    setLoading(true);
    // Implementation would match the original component
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">Fleet Track Dynamics</h1>
          <p className="text-slate-300">Choose your account type to get started</p>
        </div>

        {error && (
          <div className="max-w-md mx-auto bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Test Account Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {testAccounts.map((account) => (
            <div 
              key={account.role}
              className={`rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br ${account.gradient}`}
            >
              <div className="p-6 space-y-6">
                <div className="text-center space-y-4">
                  <div className="mx-auto bg-white/10 p-3 rounded-xl w-fit">
                    {account.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white">{account.role}</h3>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2 bg-white/10 px-3 py-2 rounded-lg">
                    <Mail size={16} className="text-white/60" />
                    <input 
                      type="email"
                      defaultValue={account.email}
                      className="bg-transparent text-white w-full outline-none placeholder-white/60"
                      readOnly
                    />
                  </div>
                  <div className="flex items-center space-x-2 bg-white/10 px-3 py-2 rounded-lg">
                    <Lock size={16} className="text-white/60" />
                    <input 
                      type="password"
                      defaultValue={account.password}
                      className="bg-transparent text-white w-full outline-none placeholder-white/60"
                      readOnly
                    />
                  </div>
                </div>

                <button 
                  onClick={() => handleTestLogin(account.email, account.password)}
                  className={`w-full bg-white ${account.textColor} py-2 rounded-lg font-medium ${account.hoverColor} transition-colors flex items-center justify-center space-x-2`}
                  disabled={loading}
                >
                  <span>{loading ? 'Logging in...' : `Login as ${account.role}`}</span>
                  {!loading && <ArrowRight size={16} />}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Custom Login Form */}
        <div className="mt-12 max-w-md mx-auto">
          <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
            <div className="p-6 space-y-6">
              <h3 className="text-xl font-bold text-white text-center">
                {isLogin ? 'Custom Login' : 'Create Account'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="flex items-center space-x-2 bg-white/10 px-3 py-2 rounded-lg">
                    <User size={16} className="text-white/60" />
                    <input 
                      type="text"
                      name="username"
                      placeholder="Username"
                      value={formData.username}
                      onChange={handleChange}
                      className="bg-transparent text-white w-full outline-none placeholder-white/60"
                    />
                  </div>
                )}
                
                <div className="flex items-center space-x-2 bg-white/10 px-3 py-2 rounded-lg">
                  <Mail size={16} className="text-white/60" />
                  <input 
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    className="bg-transparent text-white w-full outline-none placeholder-white/60"
                  />
                </div>

                <div className="flex items-center space-x-2 bg-white/10 px-3 py-2 rounded-lg">
                  <Lock size={16} className="text-white/60" />
                  <input 
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className="bg-transparent text-white w-full outline-none placeholder-white/60"
                  />
                </div>

                {!isLogin && (
                  <>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full bg-white/10 text-white px-3 py-2 rounded-lg outline-none"
                    >
                      <option value="customer" className="text-gray-900">Customer</option>
                      <option value="driver" className="text-gray-900">Driver</option>
                      <option value="admin" className="text-gray-900">Admin</option>
                    </select>

                    <div className="flex items-center space-x-2 bg-white/10 px-3 py-2 rounded-lg">
                      <Phone size={16} className="text-white/60" />
                      <input 
                        type="tel"
                        name="phoneNumber"
                        placeholder="Phone Number"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        className="bg-transparent text-white w-full outline-none placeholder-white/60"
                      />
                    </div>

                    <div className="flex items-center space-x-2 bg-white/10 px-3 py-2 rounded-lg">
                      <MapPin size={16} className="text-white/60" />
                      <input 
                        type="text"
                        name="address"
                        placeholder="Address"
                        value={formData.address}
                        onChange={handleChange}
                        className="bg-transparent text-white w-full outline-none placeholder-white/60"
                      />
                    </div>

                    {formData.role === 'driver' && (
                      <>
                        <div className="flex items-center space-x-2 bg-white/10 px-3 py-2 rounded-lg">
                          <CreditCard size={16} className="text-white/60" />
                          <input 
                            type="text"
                            name="licenseNumber"
                            placeholder="License Number"
                            value={formData.licenseNumber}
                            onChange={handleChange}
                            className="bg-transparent text-white w-full outline-none placeholder-white/60"
                          />
                        </div>

                        <div className="flex items-center space-x-2 bg-white/10 px-3 py-2 rounded-lg">
                          <Clock size={16} className="text-white/60" />
                          <input 
                            type="number"
                            name="experienceYears"
                            placeholder="Years of Experience"
                            value={formData.experienceYears}
                            onChange={handleChange}
                            className="bg-transparent text-white w-full outline-none placeholder-white/60"
                          />
                        </div>
                      </>
                    )}
                  </>
                )}

                <button 
                  type="submit"
                  className="w-full bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
                  disabled={loading}
                >
                  <span>{loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}</span>
                  {!loading && <ArrowRight size={16} />}
                </button>
              </form>

              <p className="text-center text-slate-400">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button 
                  onClick={() => setIsLogin(!isLogin)} 
                  className="text-blue-400 hover:text-blue-300 font-medium"
                >
                  {isLogin ? 'Sign Up' : 'Login'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}