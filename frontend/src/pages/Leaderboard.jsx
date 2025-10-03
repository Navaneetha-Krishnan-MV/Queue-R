import React, { useState, useEffect } from 'react';
import { leaderboardAPI } from '../utils/api';
import { io } from 'socket.io-client';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('global'); // global or venue

  useEffect(() => {
    fetchLeaderboard();
    fetchStats();
    
    // Setup socket connection for real-time updates
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
    
    socket.emit('join-leaderboard');
    
    socket.on('leaderboard-update', () => {
      fetchLeaderboard();
      fetchStats();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await leaderboardAPI.getGlobal();
      setLeaderboard(response.data);
    } catch (error) {
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await leaderboardAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading leaderboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          🏆 Global Leaderboard
        </h1>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Total Teams</p>
              <p className="text-3xl font-bold text-blue-600">{stats.totalTeams}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Total Attempts</p>
              <p className="text-3xl font-bold text-purple-600">{stats.totalAttempts}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Accuracy</p>
              <p className="text-3xl font-bold text-green-600">{stats.accuracy}%</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Top Team</p>
              <p className="text-lg font-bold text-yellow-600 truncate">
                {stats.topTeam?.teamName || 'N/A'}
              </p>
              <p className="text-sm text-gray-500">{stats.topTeam?.score || 0} pts</p>
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        {leaderboard.length === 0 ? (
          <div className="text-center text-gray-600 bg-white rounded-lg shadow p-8">
            No teams registered yet
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                      Team Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                      Leader
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                      Venue
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                      Score
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {leaderboard.map((team, index) => (
                    <tr 
                      key={team.teamId}
                      className={`${
                        index < 3 ? 'bg-yellow-50' : 'bg-white hover:bg-gray-50'
                      } transition-colors`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {index === 0 && <span className="text-3xl mr-2">🥇</span>}
                          {index === 1 && <span className="text-3xl mr-2">🥈</span>}
                          {index === 2 && <span className="text-3xl mr-2">🥉</span>}
                          <span className="text-lg font-bold text-gray-900">
                            #{team.rank}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">
                          {team.teamName}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {team.leaderName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {team.venueName}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-800">
                          {team.score} pts
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Venue Statistics */}
        {stats && stats.venues && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Venue Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.venues.map((venue) => (
                <div key={venue.venueName} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2">{venue.venueName}</h3>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-600">
                      Teams: <span className="font-medium text-gray-900">{venue.teamsCount}</span>
                    </p>
                    <p className="text-gray-600">
                      Solved: <span className="font-medium text-green-600">{venue.expiredQuestions}</span>
                    </p>
                    <p className="text-gray-600">
                      Available: <span className="font-medium text-blue-600">{venue.activeQuestions}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Refresh Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;