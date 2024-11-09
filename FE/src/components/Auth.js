import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Truck, Shield, ArrowRight, Mail, Lock, Phone, MapPin, CreditCard, Clock } from 'lucide-react';
import { useAuth } from './context/AuthContext';

const BACKEND_URL = "https://fleet-track-dynamics-atlan-production.up.railway.app";


// Custom CSS animations
const styles = `
@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
  20%, 40%, 60%, 80% { transform: translateX(2px); }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

.animate-slide-up {
  animation: slideUp 0.5s ease forwards;
}

.animate-fade-in {
  animation: fadeIn 0.5s ease forwards;
}

.animate-shake {
  animation: shake 0.5s ease forwards;
}

.animate-pulse {
  animation: pulse 2s infinite;
}

.shimmer {
  background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 100%);
  background-size: 1000px 100%;
  animation: shimmer 2s infinite linear;
}

.card-hover {
  transition: all 0.3s ease;
}

.card-hover:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
}

.input-focus {
  transition: all 0.3s ease;
}

.input-focus:focus {
  transform: scale(1.02);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}

.button-hover {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.button-hover:before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: all 0.5s ease;
}

.button-hover:hover:before {
  left: 100%;
}
`;

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [animateError, setAnimateError] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const testAccounts = [
    { role: 'Customer', email: 'rupaparadhaval1234@gmail.com', password: 'atlanbackend', icon: <User size={24} />, gradient: 'from-blue-500 to-blue-600' },
    { role: 'Driver', email: 'janesmith1@example.com', password: 'securepassword456', icon: <Truck size={24} />, gradient: 'from-green-500 to-green-600' },
    { role: 'Admin', email: 'admin@example.com', password: 'adminpass123', icon: <Shield size={24} />, gradient: 'from-purple-500 to-purple-600' },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const storeUserData = (data) => {
    localStorage.clear();
    localStorage.setItem('token', data.token);
    localStorage.setItem('userId', data.user.id);
    localStorage.setItem('email', data.user.email);
    localStorage.setItem('role', data.user.role);
    localStorage.setItem('username', data.user.username);
  };

  const processAuthResponse = async (data) => {
    if (data.success && data.token && data.user) {
      storeUserData(data);
      await login(data.user);
      navigate('/', { replace: true });
    } else {
      throw new Error(data.message || 'Authentication failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = `${BACKEND_URL}/api/v2/auth/${isLogin ? 'login' : 'signup'}`;
      const requestData = isLogin ? 
        { email: formData.email, password: formData.password } : 
        formData;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      await processAuthResponse(data);
    } catch (error) {
      console.error('Auth error:', error);
      setError(error.message || 'An error occurred during authentication');
      setAnimateError(true);
      setTimeout(() => setAnimateError(false), 500);
    } finally {
      setLoading(false);
    }
  };

  const handleTestLogin = async (email, password) => {
    setLoading(true);
    setError(null);
  
    try {
      const response = await fetch(`${BACKEND_URL}/api/v2/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      await processAuthResponse(data);
    } catch (error) {
      console.error('Test login error:', error);
      setError(error.message || 'An error occurred during test login');
      setAnimateError(true);
      setTimeout(() => setAnimateError(false), 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-600 flex items-center justify-center p-4">
        <div className="max-w-6xl w-full space-y-8 animate-slide-up">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-white">LogistiQ</h1>
            <p className="text-slate-300 animate-fade-in">Choose your account type to get started</p>
          </div>

          {error && (
            <div className={`max-w-md mx-auto bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 rounded-lg ${animateError ? 'animate-shake' : ''}`}>
              {error}
            </div>
          )}

          {/* Test Account Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {testAccounts.map((account, index) => (
              <div 
                key={account.role}
                className={`card-hover rounded-lg overflow-hidden bg-gradient-to-br ${account.gradient}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="p-6 space-y-6">
                  <div className="text-center space-y-4">
                    <div className="mx-auto bg-white/10 p-3 rounded-xl w-fit animate-pulse">
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
                        className="bg-transparent text-white w-full outline-none placeholder-white/60 input-focus"
                        readOnly
                      />
                    </div>
                    <div className="flex items-center space-x-2 bg-white/10 px-3 py-2 rounded-lg">
                      <Lock size={16} className="text-white/60" />
                      <input 
                        type="password"
                        defaultValue={account.password}
                        className="bg-transparent text-white w-full outline-none placeholder-white/60 input-focus"
                        readOnly
                      />
                    </div>
                  </div>

                  <button 
                    onClick={() => handleTestLogin(account.email, account.password)}
                    className="w-full bg-white text-gray-800 py-2 rounded-lg font-medium button-hover flex items-center justify-center space-x-2"
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
            <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden card-hover">
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
                        className="bg-transparent text-white w-full outline-none placeholder-white/60 input-focus"
                        required
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
                      className="bg-transparent text-white w-full outline-none placeholder-white/60 input-focus"
                      required
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
                      className="bg-transparent text-white w-full outline-none placeholder-white/60 input-focus"
                      required
                    />
                  </div>

                  {!isLogin && (
                    <>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full bg-white/10 text-white px-3 py-2 rounded-lg outline-none input-focus"
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
                          className="bg-transparent text-white w-full outline-none placeholder-white/60 input-focus"
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
                          className="bg-transparent text-white w-full outline-none placeholder-white/60 input-focus"
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
                              className="bg-transparent text-white w-full outline-none placeholder-white/60 input-focus"
                              required
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
                              className="bg-transparent text-white w-full outline-none placeholder-white/60 input-focus"
                              required
                            />
                          </div>
                        </>
                      )}
                    </>
                  )}

                  <button 
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 rounded-lg font-medium button-hover group flex items-center justify-center space-x-2 relative overflow-hidden"
                    disabled={loading}
                  >
                    <div className="relative z-10 flex items-center justify-center space-x-2">
                      <span>{loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}</span>
                      {!loading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                    </div>
                    <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100"></div>
                  </button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-slate-900/50 text-slate-400">or</span>
                  </div>
                </div>

                <p className="text-center text-slate-400">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button 
                    onClick={() => setIsLogin(!isLogin)} 
                    className="text-blue-400 hover:text-blue-300 font-medium transition-colors relative group"
                  >
                    {isLogin ? 'Sign Up' : 'Login'}
                    <span className="absolute -bottom-0.5 left-0 w-full h-0.5 bg-blue-400 origin-left transform scale-x-0 transition-transform group-hover:scale-x-100"></span>
                  </button>
                </p>
              </div>
            </div>
          </div>

          {/* Footer with animated gradient border */}
          <div className="text-center text-slate-400 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent animate-shimmer"></div>
            <p className="relative">
              Secure login powered by LogistiQ
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Auth;