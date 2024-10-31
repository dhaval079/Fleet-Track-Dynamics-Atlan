import React, { useState } from 'react';
import { Search, Home, Calendar, User, MapPin, LogOut } from 'lucide-react';

const Navbar = () => {
  const [activeItem, setActiveItem] = useState('home');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [notifications] = useState(3);

  // Navigation items configuration
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'book', label: 'Book a Ride', icon: Calendar },
    { id: 'rides', label: 'My Rides', icon: MapPin, notifications: notifications },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'track', label: 'Track Ride', icon: MapPin, hasLiveIndicator: true }
  ];

  return (
    <nav className="relative h-20 bg-gradient-to-r from-slate-900 to-slate-800 shadow-lg">
      {/* Frosted glass effect overlay */}
      <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-sm" />

      <div className="relative h-full max-w-7xl mx-auto px-4 flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center space-x-2 group">
          <div className="relative">
            <div className="w-10 h-10 bg-blue-600 rounded-lg transform transition-all duration-300 group-hover:rotate-12 group-hover:scale-110">
              <div className="absolute inset-0 bg-blue-500 rounded-lg transform rotate-3 group-hover:rotate-6 transition-transform" />
              <span className="absolute inset-0 flex items-center justify-center text-white font-bold">L</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold text-xl tracking-tight">LogistiQ</span>
            <span className="text-slate-400 text-xs font-medium">ENTERPRISE</span>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex items-center space-x-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveItem(item.id)}
              className={`relative group px-4 py-2 rounded-full transition-all duration-300 ${
                activeItem === item.id
                  ? 'bg-blue-600/20 text-white'
                  : 'hover:bg-white/5 text-slate-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <item.icon 
                  className={`w-4 h-4 transition-all duration-300 ${
                    activeItem === item.id ? 'text-blue-400' : 'text-slate-400'
                  } group-hover:text-blue-400`} 
                />
                <span className="font-medium">{item.label}</span>
              </div>

              {/* Active indicator line */}
              <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-blue-500 transition-all duration-300 ${
                activeItem === item.id ? 'w-4/5' : 'group-hover:w-1/2'
              }`} />

              {/* Notification badge */}
              {item.notifications && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">{item.notifications}</span>
                </div>
              )}

              {/* Live indicator */}
              {item.hasLiveIndicator && (
                <div className="absolute top-1/2 -translate-y-1/2 right-2">
                  <div className="relative w-2 h-2">
                    <div className="absolute inset-0 bg-green-500 rounded-full animate-ping" />
                    <div className="relative w-2 h-2 bg-green-500 rounded-full" />
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Right Section: Search & Logout */}
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className={`relative transition-all duration-300 ${
            isSearchFocused ? 'w-64' : 'w-48'
          }`}>
            <input
              type="text"
              placeholder="Search rides..."
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="w-full bg-white/5 rounded-full py-2 pl-10 pr-4 text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>

          {/* Logout Button */}
          <button className="relative group p-2 rounded-full bg-red-500/10 hover:bg-red-500/20 transition-all duration-300">
            <LogOut className="w-5 h-5 text-red-500 transition-all duration-300 group-hover:rotate-12" />
            <div className="absolute inset-0 bg-red-500/10 rounded-full transform scale-0 group-hover:scale-100 transition-transform duration-300" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;