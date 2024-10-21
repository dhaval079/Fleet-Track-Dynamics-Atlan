import React, { useState, useCallback, memo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Menu, X, ChevronDown } from 'lucide-react';

const NavLink = memo(({ to, children, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className={`block py-2 px-4 ${
        isActive
          ? 'bg-blue-700 text-white'
          : 'text-blue-200 hover:bg-blue-700 hover:text-white'
      } rounded transition duration-300`}
      onClick={onClick}
    >
      {children}
    </Link>
  );
});

const Navbar = memo(() => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/login');
  }, [logout, navigate]);

  const toggleMenu = useCallback(() => setIsOpen(prev => !prev), []);
  const toggleDropdown = useCallback(() => setDropdownOpen(prev => !prev), []);

  if (!user) return null;

  return (
    <nav className="bg-blue-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-white text-2xl font-bold">
              RideStream
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <NavLink to="/">Home</NavLink>
              {user.role === 'customer' && (
                <>
                  <NavLink to="/book">Book a Ride</NavLink>
                  <NavLink to="/rides">My Rides</NavLink>
                </>
              )}
              {user.role === 'driver' && (
                <div className="relative group">
                  <button
                    className="text-blue-200 hover:bg-blue-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center"
                    onClick={toggleDropdown}
                  >
                    Driver <ChevronDown className="ml-1 h-4 w-4" />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md overflow-hidden shadow-xl z-10">
                      <NavLink to="/driver/dashboard" onClick={toggleDropdown}>Dashboard</NavLink>
                      <NavLink to="/driver/update-location" onClick={toggleDropdown}>Update Location</NavLink>
                      <NavLink to="/driver/vehicles" onClick={toggleDropdown}>Vehicle Management</NavLink>
                    </div>
                  )}
                </div>
              )}
              {user.role === 'admin' && (
                <NavLink to="/admin">Admin Dashboard</NavLink>
              )}
              <NavLink to="/profile">Profile</NavLink>
              <NavLink to="/tracking">Track Ride</NavLink>
            </div>
          </div>
          <div className="hidden md:block">
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-300"
            >
              Logout
            </button>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={toggleMenu}
              className="bg-blue-700 inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-800 focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <NavLink to="/" onClick={toggleMenu}>Home</NavLink>
            {user.role === 'customer' && (
              <>
                <NavLink to="/book" onClick={toggleMenu}>Book a Ride</NavLink>
                <NavLink to="/rides" onClick={toggleMenu}>My Rides</NavLink>
              </>
            )}
            {user.role === 'driver' && (
              <>
                <NavLink to="/driver/dashboard" onClick={toggleMenu}>Driver Dashboard</NavLink>
                <NavLink to="/driver/update-location" onClick={toggleMenu}>Update Location</NavLink>
                <NavLink to="/driver/vehicles" onClick={toggleMenu}>Vehicle Management</NavLink>
              </>
            )}
            {user.role === 'admin' && (
              <NavLink to="/admin" onClick={toggleMenu}>Admin Dashboard</NavLink>
            )}
            <NavLink to="/profile" onClick={toggleMenu}>Profile</NavLink>
            <NavLink to="/tracking" onClick={toggleMenu}>Track Ride</NavLink>
          </div>
          <div className="pt-4 pb-3 border-t border-blue-700">
            <div className="px-2">
              <button
                onClick={handleLogout}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-300"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
});

export default Navbar;