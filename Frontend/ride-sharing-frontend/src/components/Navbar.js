import React from 'react';
import { Link } from 'react-router-dom';

function Navbar({ userRole, onLogout }) {
  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold">
            Ride Sharing
          </Link>
          <div className="space-x-4">
            <Link to="/" className="hover:text-blue-200">Home</Link>
            <Link to="/book" className="hover:text-blue-200">Book a Ride</Link>
            <Link to="/rides" className="hover:text-blue-200">My Rides</Link>
            <Link to="/profile" className="hover:text-blue-200">Profile</Link>
            {userRole === 'driver' && (
              <>
                <Link to="/jobs" className="hover:text-blue-200">My Jobs</Link>
                <Link to="/vehicles" className="hover:text-blue-200">Vehicle Management</Link>
              </>
            )}
            {userRole === 'admin' && (
              <Link to="/admin" className="hover:text-blue-200">Admin Dashboard</Link>
            )}
          </div>
          <button onClick={onLogout} className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-blue-100">
            Log Out
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;