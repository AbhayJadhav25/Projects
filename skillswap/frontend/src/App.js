import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SkillExchange from './pages/SkillExchange';
import UserProfile from './pages/UserProfile';
import Community from './pages/Community';
import Resources from './pages/Resources';
import LearningHub from './pages/LearningHub';
import Profile from './pages/Profile';
import ProfileSetup from './pages/ProfileSetup';

// Components
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/auth/ProtectedRoute';

import './index.css';

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />

        {/* Protected routes with Navbar */}
        <Route path="/profile/setup" element={
          <ProtectedRoute>
            <ProfileSetup />
          </ProtectedRoute>
        } />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Navbar />
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/skill-exchange" element={
          <ProtectedRoute>
            <Navbar />
            <SkillExchange />
          </ProtectedRoute>
        } />

        <Route path="/user/:id" element={
          <ProtectedRoute>
            <Navbar />
            <UserProfile />
          </ProtectedRoute>
        } />

        <Route path="/community" element={
          <ProtectedRoute>
            <Navbar />
            <Community />
          </ProtectedRoute>
        } />

        <Route path="/resources" element={
          <ProtectedRoute>
            <Navbar />
            <Resources />
          </ProtectedRoute>
        } />

        <Route path="/learning-hub" element={
          <ProtectedRoute>
            <Navbar />
            <LearningHub />
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <Navbar />
            <Profile />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
