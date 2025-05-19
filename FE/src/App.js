// src/App.js
import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet
} from 'react-router-dom';

import { AuthProvider, useAuth } from './components/context/AuthContext';
import { SearchProvider } from './components/context/SearchContext';

import Auth from './components/Auth';
import ErrorPage from './components/ErrorPage';
import Home from './Pages/Home';
import BookingComponent from './components/Booking/Booking';
import TrackingComponent from './components/Track/Tracking';
import UserProfile from './components/User/UserProfile';
import DriverDashboard from './components/Driver/DriverDashboard';
import DriverLocationUpdate from './components/Driver/DriverLocationUpdate';
import VehicleManagement from './components/Vehicle/VehicleManagement';
import AdminDashboardComponent from './components/Admin/AdminDashboard';
import MyRides from './components/Rides/MyRides';
import Navbar from './components/Navbar';

// A wrapper that checks auth before rendering its children
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

// The layout that all protected pages share
function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#050505]">
      <header className="w-full">
        <Navbar />
      </header>

      <main className="flex-grow w-full">
        {/* Outlet renders the matched child Route */}
        <Outlet />
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <SearchProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route
              path="/login"
              element={<Auth />}
            />
            <Route path="/error" element={<ErrorPage />} />

            {/* All routes below are protected and use the Layout */}
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              {/* Home at “/” */}
              <Route index element={<Home />} />

              {/* Shared pages */}
              <Route path="profile" element={<UserProfile />} />
              <Route path="tracking" element={<TrackingComponent />} />

              {/* Customer-only */}
              <Route
                path="book"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <BookingComponent />
                  </ProtectedRoute>
                }
              />
              <Route
                path="rides"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <MyRides />
                  </ProtectedRoute>
                }
              />

              {/* Driver-only */}
              <Route
                path="driver/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['driver']}>
                    <DriverDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="driver/update-location"
                element={
                  <ProtectedRoute allowedRoles={['driver']}>
                    <DriverLocationUpdate />
                  </ProtectedRoute>
                }
              />
              <Route
                path="driver/vehicles"
                element={
                  <ProtectedRoute allowedRoles={['driver']}>
                    <VehicleManagement />
                  </ProtectedRoute>
                }
              />

              {/* Admin-only */}
              <Route
                path="admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboardComponent />
                  </ProtectedRoute>
                }
              />

              {/* Catch‑all for 404 within protected */}
              <Route path="*" element={<ErrorPage />} />
            </Route>
          </Routes>
        </Router>
      </SearchProvider>
    </AuthProvider>
  );
}

export default App;
