import React, { useState, useCallback, memo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Menu, X, ChevronDown, Home, Calendar, User, MapPin, LogOut, Search, Settings } from 'lucide-react';
import { useSearch } from './context/SearchContext';

const NavLink = memo(({ to, children, onClick, icon: Icon }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
 


  return (
    <Link
      to={to}
      className={`relative group flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${
        isActive 
          ? 'bg-blue-600/20 text-white' 
          : 'text-slate-300 hover:bg-white/5'
      }`}
      onClick={onClick}
    >
      {Icon && (
        <Icon 
          className={`w-4 h-4 transition-colors duration-300 ${
            isActive ? 'text-blue-400' : 'text-slate-400'
          } group-hover:text-blue-400`} 
        />
      )}
      <span className="font-medium">{children}</span>
      
      {/* Active indicator line */}
      <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-blue-500 transition-all duration-300 ${
        isActive ? 'w-4/5' : 'w-0 group-hover:w-1/2'
      }`} />
    </Link>
  );
});

NavLink.displayName = 'NavLink';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // Add this line
  const { setSearchQuery } = useSearch();

  const [searchInput, setSearchInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleSearch = useCallback((e) => {
    const query = e.target.value;
    setSearchInput(query);
    setSearchQuery(query.toLowerCase());
    if (location.pathname !== '/rides') {
      navigate('/rides');
    }
  }, [setSearchQuery, navigate, location.pathname]); // Add location.pathname to dependencies


  const handleLogout = useCallback(async () => {
    try {
      await logout();
      window.location.reload();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [logout]);

  const toggleMenu = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const toggleDropdown = useCallback(() => {
    setDropdownOpen(prev => !prev);
  }, []);

  const closeMenus = useCallback(() => {
    setIsOpen(false);
    setDropdownOpen(false);
  }, []);

  // Verify user and token exist before rendering
  const token = localStorage.getItem('token');
  if (!user || !token) return null;

  return (
    <nav className="relative h-20 bg-gradient-to-r from-slate-900 to-slate-800 shadow-lg">
      {/* Frosted glass effect overlay */}
      <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-sm" />

      <div className="relative h-full max-w-7xl mx-auto px-4 flex items-center justify-between">
        {/* Logo Section */}
        <Link to="/" className="flex items-center space-x-2 group">
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
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1">
          <NavLink to="/" icon={Home} onClick={closeMenus}>Home</NavLink>
          
          {user.role === 'customer' && (
            <>
              <NavLink to="/book" icon={Calendar} onClick={closeMenus}>Book a Ride</NavLink>
              <NavLink to="/rides" icon={MapPin} onClick={closeMenus}>My Rides</NavLink>
            </>
          )}
          
          {user.role === 'driver' && (
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="flex items-center space-x-2 px-4 py-2 rounded-full text-slate-300 hover:bg-white/5 transition-all duration-300"
              >
                <Settings className="w-4 h-4" />
                <span>Driver</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {dropdownOpen && (
                <div className="absolute top-full mt-2 w-48 bg-slate-800 rounded-lg shadow-lg overflow-hidden z-50">
                  <NavLink to="/driver/dashboard" icon={Home} onClick={closeMenus}>Dashboard</NavLink>
                  <NavLink to="/driver/update-location" icon={MapPin} onClick={closeMenus}>Update Location</NavLink>
                  <NavLink to="/driver/vehicles" icon={Calendar} onClick={closeMenus}>Vehicle Management</NavLink>
                </div>
              )}
            </div>
          )}
          
          {user.role === 'admin' && (
            <NavLink to="/admin" icon={Settings} onClick={closeMenus}>Admin Dashboard</NavLink>
          )}
          
          <NavLink to="/profile" icon={User} onClick={closeMenus}>Profile</NavLink>
          <NavLink to="/tracking" icon={MapPin} onClick={closeMenus}>
            Track Ride &nbsp;
            <div className="absolute top-1/2 -translate-y-1/2 right-2">
              <div className="relative w-2 h-2">
                <div className="absolute inset-0 bg-green-500 rounded-full animate-ping" />
                <div className="relative w-2 h-2 bg-green-500 rounded-full" />
              </div>
            </div>
          </NavLink>
        </div>

        {/* Right Section: Search & Logout */}
        <div className="hidden md:flex items-center space-x-4">
        <div className={`relative transition-all duration-300 ${
    isSearchFocused ? 'w-64' : 'w-48'
  }`}>
    <input
      type="text"
      value={searchInput}
      onChange={handleSearch}
      placeholder="Search by origin or destination..."
      onFocus={() => setIsSearchFocused(true)}
      onBlur={() => setIsSearchFocused(false)}
      className="w-full bg-white/5 rounded-full py-2 pl-10 pr-4 text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
    />
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
    {searchInput && (
      <button
        onClick={() => {
          setSearchInput('');
          setSearchQuery('');
        }}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
      >
        <X className="w-4 h-4" />
      </button>
    )}
  </div>

          <button
            onClick={handleLogout}
            className="relative group p-2 rounded-full bg-red-500/10 hover:bg-red-500/20 transition-all duration-300"
          >
            <LogOut className="w-5 h-5 text-red-500 transition-all duration-300 group-hover:rotate-12" />
            <div className="absolute inset-0 bg-red-500/10 rounded-full transform scale-0 group-hover:scale-100 transition-transform duration-300" />
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className="relative p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors duration-300"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <Menu className="w-6 h-6 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-slate-900/95 backdrop-blur-sm md:hidden z-50">
          <div className="px-4 pt-2 pb-3 space-y-1">
            <NavLink to="/" icon={Home} onClick={closeMenus}>Home</NavLink>
            
            {user.role === 'customer' && (
              <>
                <NavLink to="/book" icon={Calendar} onClick={closeMenus}>Book a Ride</NavLink>
                <NavLink to="/rides" icon={MapPin} onClick={closeMenus}>My Rides</NavLink>
              </>
            )}
            
            {user.role === 'driver' && (
              <>
                <NavLink to="/driver/dashboard" icon={Home} onClick={closeMenus}>Driver Dashboard</NavLink>
                <NavLink to="/driver/update-location" icon={MapPin} onClick={closeMenus}>Update Location</NavLink>
                <NavLink to="/driver/vehicles" icon={Calendar} onClick={closeMenus}>Vehicle Management</NavLink>
              </>
            )}
            
            {user.role === 'admin' && (
              <NavLink to="/admin" icon={Settings} onClick={closeMenus}>Admin Dashboard</NavLink>
            )}
            
            <NavLink to="/profile" icon={User} onClick={closeMenus}>Profile</NavLink>
            <NavLink to="/tracking" icon={MapPin} onClick={closeMenus}>Track Ride</NavLink>
          </div>
          
          <div className="px-4 py-3 border-t border-slate-700">
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

Navbar.displayName = 'Navbar';

export default memo(Navbar);