import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Common/Layout.jsx';
import Home from './pages/Home.jsx';
import Admin from './pages/Admin.jsx';
import Question from './pages/Question.jsx';
import Leaderboard from './pages/Leaderboard.jsx';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/question/:questionId" element={<Question />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;