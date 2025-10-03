import React, { useState } from 'react';
import { adminAPI } from '../../utils/api';

const VenueManagement = ({ onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSetupVenues = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await adminAPI.setupVenues();
      setMessage(`✅ ${response.data.message}`);
      if (onUpdate) onUpdate();
    } catch (error) {
      setMessage(`❌ ${error.response?.data?.message || 'Failed to setup venues'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleResetEvent = async () => {
    if (!window.confirm('Are you sure you want to reset the entire event? This will clear all attempts and reset scores!')) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await adminAPI.resetEvent();
      setMessage(`✅ ${response.data.message}`);
      if (onUpdate) onUpdate();
    } catch (error) {
      setMessage(`❌ ${error.response?.data?.message || 'Failed to reset event'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Venue Setup</h2>
        <p className="text-gray-600 mb-4">
          Initialize 8 venues (Venue A through Venue H) for the event.
        </p>

        {message && (
          <div className={`p-4 rounded-md mb-4 ${
            message.includes('✅') 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}

        <button
          onClick={handleSetupVenues}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Setting up...' : 'Setup Venues'}
        </button>
      </div>

      <div className="border-t pt-6">
        <h2 className="text-2xl font-bold mb-4 text-red-600">Danger Zone</h2>
        <p className="text-gray-600 mb-4">
          Reset the entire event. This will:
        </p>
        <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
          <li>Clear all team attempts</li>
          <li>Reset all team scores to 0</li>
          <li>Make all questions available again in all venues</li>
        </ul>

        <button
          onClick={handleResetEvent}
          disabled={loading}
          className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? 'Resetting...' : 'Reset Event'}
        </button>
      </div>
    </div>
  );
};

export default VenueManagement;