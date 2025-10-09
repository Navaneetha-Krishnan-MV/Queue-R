import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, ProtectedRoute } from './context/AuthContext';
import Home from './pages/Home';
import AdminPage from './components/Admin/AdminPage';
import AdminLogin from './components/Admin/AdminLogin';
import VenueQuestions from './pages/VenueQuestions';
import Leaderboard from './pages/Leaderboard';
import QRScanner from './pages/QRScanner';
import Layout from './components/Common/Layout';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/admin/auth/login" element={<AdminLogin />} />
          <Route path="/QRScanner" element={<Layout><QRScanner /></Layout>} />
          <Route path="/admin/login" element={<AdminLogin />} />
          
          {/* Protected admin routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <Layout><AdminPage /></Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route path="/venue/:venueId/question/:questionId" element={<VenueQuestions />} />
          <Route path="/leaderboard" element={<Layout><Leaderboard /></Layout>} />
          
          {/* Redirect any unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;