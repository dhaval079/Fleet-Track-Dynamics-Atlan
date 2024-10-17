import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './Pages/Home';
import Auth from './components/Auth';
import BookingComponent from './components/Booking/Booking';
import TrackingComponent from './components/Track/Tracking';
import UserProfileComponent from './components/User/UserProfile';
import DriverDashboardComponent from './components/Driver/DriverDashboard';
import AdminDashboardComponent from './components/Admin/AdminDashboard';
import MyRides from './components/Rides/MyRides';

// Placeholder components
const VehicleManagement = () => <div>Vehicle Management (Driver)</div>;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');

  const handleLogin = (role) => {
    setIsAuthenticated(true);
    setUserRole(role);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole('');
  };

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        {isAuthenticated && <Navbar userRole={userRole} onLogout={handleLogout} />}
        <main className="flex-grow container mx-auto">
          <Routes>
            <Route path="/login" element={
              isAuthenticated ? <Navigate to="/" /> : <Auth onLogin={handleLogin} />
            } />
            {isAuthenticated ? (
              <>
                <Route path="/" element={<Home />} />
                <Route path="/book" element={<BookingComponent />} />
                <Route path="/rides" element={<MyRides />} />
                <Route path="/profile" element={<UserProfileComponent />} />
                <Route path="/tracking/:id" element={<TrackingComponent />} />
                {userRole === 'driver' && (
                  <>
                    <Route path="/jobs" element={<DriverDashboardComponent />} />
                    <Route path="/vehicles" element={<VehicleManagement />} />
                  </>
                )}
                {userRole === 'admin' && (
                  <Route path="/admin" element={<AdminDashboardComponent />} />
                )}
              </>
            ) : (
              <Route path="*" element={<Navigate to="/login" />} />
            )}
          </Routes>
        </main>
        <footer className="bg-gray-200 text-center py-4">
          © 2024 Ride Sharing App. All rights reserved.
        </footer>
      </div>
    </Router>
  );
}

export default App;