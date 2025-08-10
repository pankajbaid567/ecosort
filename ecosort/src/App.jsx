import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Components
import WasteGuide from './components/WasteGuide';
import Layout from './components/Layout';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import Leaderboard from './components/Leaderboard';
import MapView from './components/MapView';
import LoadingSpinner from './components/LoadingSpinner';
import PointsTracker from './components/PointsTracker';
import BinMapSimple from './components/BinMapSimple';
import ValuableGuide from './components/ValuableGuide';
import ScrapPriceBoard from './components/ScrapPriceBoard';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirect if already authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />

        {/* Protected Routes with Layout */}
        <Route path="/" element={<Layout />}>
          {/* Redirect root to waste guide */}
          <Route index element={<Navigate to="/waste-guide" replace />} />
          
          {/* Waste Guide - accessible to all users */}
          <Route path="waste-guide" element={<WasteGuide />} />
          
          {/* Points Tracker - protected */}
          <Route path="points-tracker" element={
            <ProtectedRoute>
              <PointsTracker />
            </ProtectedRoute>
          } />
          
          {/* Bin Map - public */}
          <Route path="bin-map" element={<BinMapSimple />} />
          
          {/* Valuable Materials Guide - public */}
          <Route path="valuable-guide" element={<ValuableGuide />} />
          
          {/* Scrap Price Board - public */}
          <Route path="scrap-prices" element={<ScrapPriceBoard />} />
          
          {/* Protected routes */}
          <Route path="dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          
          <Route path="leaderboard" element={<Leaderboard />} />
          
          <Route path="map" element={<MapView />} />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center bg-eco-bg">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-eco-green mb-4">404</h1>
              <p className="text-xl text-eco-dark mb-6">Page not found</p>
              <a 
                href="/waste-guide" 
                className="btn-primary inline-block"
              >
                Go to Waste Guide
              </a>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <AppRoutes />
        
        {/* Global Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#212121',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(76, 175, 80, 0.15)',
            },
            success: {
              iconTheme: {
                primary: '#4CAF50',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#F44336',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </AuthProvider>
  );
}

export default App;
