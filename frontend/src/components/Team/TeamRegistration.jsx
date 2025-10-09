import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { venueAPI, teamAPI } from '../../utils/api';
import { useTeamAuth } from '../../context/TeamAuthContext';

const TeamRegistration = () => {
  const navigate = useNavigate();
  const { teamLogin } = useTeamAuth();
  const [venues, setVenues] = useState([]);
  const [formData, setFormData] = useState({
    teamName: '',
    leaderName: '',
    email: '',
    venueId: '',
    registrationCode: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      const response = await venueAPI.getAll();
      setVenues(response.data);
    } catch (error) {
      console.error('Failed to fetch venues');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await teamAPI.register(formData);
      setSuccess(true);
      
      // Auto-login after successful registration
      setTimeout(async () => {
        const loginResult = await teamLogin(formData.teamName, formData.registrationCode);
        if (loginResult.success) {
          navigate('/');
        }
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6">Team Registration</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Team Name
          </label>
          <input
            type="text"
            name="teamName"
            value={formData.teamName}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Leader Name
          </label>
          <input
            type="text"
            name="leaderName"
            value={formData.leaderName}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Venue
          </label>
          <select
            name="venueId"
            value={formData.venueId}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a venue</option>
            {venues.map((venue) => (
              <option 
                key={venue.id} 
                value={venue.id}
                disabled={venue.isFull}
              >
                {venue.venueName} ({venue.teamsCount}/5 teams)
                {venue.isFull && ' - FULL'}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Registration Code
          </label>
          <input
            type="text"
            name="registrationCode"
            value={formData.registrationCode}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your registration code"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Registering...' : 'Register Team'}
        </button>
      </form>
    </div>
  );
};

export default TeamRegistration;