import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import VenueQuestions from './pages/VenueQuestions';
import Leaderboard from './pages/Leaderboard';
import QuestionList from './components/Team/QuestionList';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/venue/:venueId/question/:questionId" element={<VenueQuestions />} />
        <Route path="/leaderboard" element={<Layout><Leaderboard /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;