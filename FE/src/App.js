import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './Pages/Home';
import Auth from './components/Auth';
import BookingComponent from './components/Booking/Booking';
import TrackingComponent from './components/Track/Tracking';
import UserProfile from './components/User/UserProfile';
import DriverDashboard from './components/Driver/DriverDashboard';
import AdminDashboardComponent from './components/Admin/AdminDashboard';
import MyRides from './components/Rides/MyRides';
import ErrorPage from './components/ErrorPage';
import { AuthProvider, useAuth } from './components/context/AuthContext';
import DriverLocationUpdate from './components/Driver/DriverLocationUpdate';
import VehicleManagement from './components/Vehicle/VehicleManagement';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  const token = localStorage.getItem('token');

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/error" replace />;
  }

  return children;
};

// Separate layout component that uses useAuth
const AppLayout = () => {
  const { user } = useAuth();
  const token = localStorage.getItem('token');

  // Only show navbar if both user and token exist
  return (
    <div className="flex flex-col min-h-screen">
      {user && token && <Navbar />}
      <main className="flex-grow container mx-auto">
        <AppRoutes />
      </main>
      {/* <footer className="bg-grey text-center py-4">
        © 2024 Ride Sharing App. All rights reserved.
      </footer> */}
    </div>
  );
};

function AppRoutes() {
  const { user } = useAuth();
  const token = localStorage.getItem('token');
  return (
    <Routes>
      <Route
        path="/login"
        element={(user && token) ? <Navigate to="/" replace /> : <Auth />}
      />
      <Route path="/error" element={<ErrorPage />} />

      {/* Protected Routes */}
      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
      <Route path="/tracking" element={<ProtectedRoute><TrackingComponent /></ProtectedRoute>} />

      {/* Customer Routes */}
      {user?.role === 'customer' && (
        <>
          <Route path="/book" element={<ProtectedRoute><BookingComponent /></ProtectedRoute>} />
          <Route path="/rides" element={<ProtectedRoute><MyRides /></ProtectedRoute>} />
        </>
      )}

      {/* Driver Routes */}
      {user?.role === 'driver' && (
        <>
          <Route path="/driver/dashboard" element={<ProtectedRoute><DriverDashboard /></ProtectedRoute>} />
          <Route path="/driver/update-location" element={<ProtectedRoute><DriverLocationUpdate /></ProtectedRoute>} />
          <Route path="/driver/vehicles" element={<ProtectedRoute><VehicleManagement /></ProtectedRoute>} />
        </>
      )}

      {/* Admin Routes */}
      {user?.role === 'admin' && (
        <Route path="/admin" element={<ProtectedRoute><AdminDashboardComponent /></ProtectedRoute>} />
      )}
    </Routes>
  );
}

// Main App component doesn't use useAuth directly
function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  );
}

export default App;