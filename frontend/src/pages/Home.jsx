import React, { useState, useEffect } from 'react';
import TeamRegistration from '../components/Team/TeamRegistration.jsx';

const Home = () => {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-800 mb-4">
            🎯 QR Code Challenge Event
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Scan QR codes around campus, answer questions, and compete with other teams 
            for the top spot on the leaderboard!
          </p>
        </div>

        {!isRegistered ? (
          <TeamRegistration onRegistrationSuccess={handleRegistrationSuccess} />
        ) : (
          <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg text-center">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-green-600 mb-2">
                ✅ Team Registered!
              </h2>
              <div className="text-gray-700">
                <p><strong>Team:</strong> {teamData.teamName}</p>
                <p><strong>Leader:</strong> {teamData.leaderName}</p>
                <p><strong>Points:</strong> {teamData.totalPoints}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">How to Play:</h3>
                <ol className="text-sm text-blue-700 text-left space-y-1">
                  <li>1. Find QR codes placed around the campus</li>
                  <li>2. Scan them with your phone camera</li>
                  <li>3. Answer the questions correctly</li>
                  <li>4. Earn points and climb the leaderboard!</li>
                </ol>
              </div>

              <div className="flex flex-col space-y-3">
                <a
                  href="/leaderboard"
                  className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  View Leaderboard
                </a>
                
                <button
                  onClick={handleStartOver}
                  className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                >
                  Register Different Team
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;