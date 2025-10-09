import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TeamRegistration from '../components/Team/TeamRegistration';

const Home = () => {
  const navigate = useNavigate();
  const [isRegistered, setIsRegistered] = useState(false);
  const [teamData, setTeamData] = useState(null);

  useEffect(() => {
    const savedTeamData = localStorage.getItem('teamData');
    if (savedTeamData) {
      setTeamData(JSON.parse(savedTeamData));
      setIsRegistered(true);
    }
  }, []);

  const handleRegistrationSuccess = (team) => {
    setTeamData(team);
    setIsRegistered(true);
  };

  const handleStartOver = () => {
    localStorage.removeItem('teamId');
    localStorage.removeItem('teamData');
    setIsRegistered(false);
    setTeamData(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            🎯 Multi-Venue QR Challenge
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Compete across 8 venues! Answer MCQ questions by scanning QR codes. 
            First correct answer in your venue expires the question. 
            Race against time to maximize your points!
          </p>
        </div>

        {!isRegistered ? (
          <TeamRegistration onRegistrationSuccess={handleRegistrationSuccess} />
        ) : (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-lg mb-6">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-green-600 mb-2">
                  ✅ Registration Complete!
                </h2>
                <div className="text-lg text-gray-700 space-y-2">
                  <p><strong>Team:</strong> {teamData.teamName}</p>
                  <p><strong>Leader:</strong> {teamData.leaderName}</p>
                  <p><strong>Venue:</strong> {teamData.venue}</p>
                  <p><strong>Score:</strong> {teamData.score} points</p>
                </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg mb-6">
                <h3 className="font-semibold text-blue-900 mb-3 text-lg">📋 How to Play:</h3>
                <ol className="text-sm text-blue-800 space-y-2">
                  <li className="flex items-start">
                    <span className="font-bold mr-2">1.</span>
                    <span>Find and scan QR codes placed around your venue</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2">2.</span>
                    <span>Answer multiple-choice questions within 20 seconds</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2">3.</span>
                    <span>Earn points based on speed: Points = Base Points - Time Taken</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2">4.</span>
                    <span>First correct answer in your venue expires that question</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2">5.</span>
                    <span>One attempt per question - choose wisely!</span>
                  </li>
                </ol>
              </div>

              <div className="flex flex-col items-center justify-center space-y-4">
                <button
                  onClick={() => navigate(`/QRScanner`)}
                  className="bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 font-semibold text-lg transition-colors duration-200 flex items-center"
                >
                  <span className="mr-2">📷</span> Open QR Scanner
                </button>
                <p className="text-gray-600 text-center">Use this to scan QR codes placed around your venue</p>
              </div>

            </div>

            {/* Game Rules Card */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="font-bold text-xl mb-4 text-gray-800">⚡ Important Rules:</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span>Each venue has the same 20 questions with independent states</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span>Questions expire only in YOUR venue when answered correctly</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span>You can only attempt each question once (correct or incorrect)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span>Faster answers = More points (20 seconds max per question)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span>Global leaderboard ranks teams across all 8 venues</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;