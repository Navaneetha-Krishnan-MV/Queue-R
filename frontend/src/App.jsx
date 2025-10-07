import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import VenueQuestions from './pages/VenueQuestions';
import Leaderboard from './pages/Leaderboard';
import QuestionList from './components/Team/QuestionList';
import Layout from './components/Common/Layout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/admin" element={<Layout><Admin /></Layout>} />
        <Route path="/venue/:venueId/questions" element={<Layout><QuestionList /></Layout>} />
        <Route path="/venue/:venueId/question/:questionId" element={<Layout><VenueQuestions /></Layout>} />
        <Route path="/leaderboard" element={<Layout><Leaderboard /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;