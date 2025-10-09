import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, ProtectedRoute } from './context/AuthContext';
import { TeamAuthProvider, ProtectedTeamRoute } from './context/TeamAuthContext';
import Home from './pages/Home';
import AdminPage from './components/Admin/AdminPage';
import AdminLogin from './components/Admin/AdminLogin';
import TeamLogin from './components/Team/TeamLogin';
import TeamRegistration from './components/Team/TeamRegistration';
import TeamDashboard from './components/Team/TeamDashboard';
import VenueQuestions from './pages/VenueQuestions';
import Leaderboard from './pages/Leaderboard';
import QRScanner from './pages/QRScanner';
import Layout from './components/Common/Layout';
import { Toaster } from 'sonner';
function App() {
  return (
    <AuthProvider>
      <TeamAuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/leaderboard" element={<Layout><Leaderboard /></Layout>} />

            {/* Team routes */}
            <Route path="/team/login" element={<TeamLogin />} />
            <Route path="/team/register" element={<Layout><TeamRegistration /></Layout>} />
            <Route path="/team/dashboard" element={<Layout><TeamDashboard /></Layout>} />

            {/* Admin auth routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/auth/login" element={<AdminLogin />} />

            {/* Protected team routes */}
            <Route
              path="/QRScanner"
              element={
                <ProtectedTeamRoute>
                  <Layout><QRScanner /></Layout>
                </ProtectedTeamRoute>
              }
            />
            <Route
              path="/venue/:venueId/question/:questionId"
              element={
                <ProtectedTeamRoute>
                  <VenueQuestions />
                </ProtectedTeamRoute>
              }
            />

            {/* Protected admin routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Layout><AdminPage /></Layout>
                </ProtectedRoute>
              }
            />

            {/* Redirect any unknown routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        <Toaster />
        </Router>
      </TeamAuthProvider>
    </AuthProvider>
  );
}

export default App;