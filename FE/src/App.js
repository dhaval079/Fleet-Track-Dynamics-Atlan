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
  if (!user) {
    return <Navigate to="/login" />;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/error" />;
  }
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Auth />} />
      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/book" element={<ProtectedRoute allowedRoles={['customer']}><BookingComponent /></ProtectedRoute>} />
      <Route path="/rides" element={<ProtectedRoute allowedRoles={['customer']}><MyRides /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
      <Route path="/tracking" element={<ProtectedRoute><TrackingComponent /></ProtectedRoute>} />
      <Route path="/driver/dashboard" element={<ProtectedRoute allowedRoles={['driver']}><DriverDashboard /></ProtectedRoute>} />
      <Route path="/driver/update-location" element={<ProtectedRoute allowedRoles={['driver']}><DriverLocationUpdate /></ProtectedRoute>} />
      <Route path="/driver/vehicles" element={<ProtectedRoute allowedRoles={['driver']}><VehicleManagement /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboardComponent /></ProtectedRoute>} />
      <Route path="/error" element={<ErrorPage />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow container mx-auto">
            <AppRoutes />
          </main>
          <footer className="bg-gray-200 text-center py-4">
            © 2024 Ride Sharing App. All rights reserved.
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;