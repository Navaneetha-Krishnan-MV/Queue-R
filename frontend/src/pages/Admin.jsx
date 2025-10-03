import React, { useState, useEffect } from 'react';
import { adminAPI } from '../utils/api';
import VenueManagement from '../components/Admin/VenueManagement';
import QuestionUpload from '../components/Admin/QuestionUpload';
import QRGenerator from '../components/Admin/QRGenerator';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('setup');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">Admin Dashboard</h1>
        
        {/* Statistics Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Total Venues</p>
              <p className="text-3xl font-bold text-blue-600">{stats.totalVenues}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Total Teams</p>
              <p className="text-3xl font-bold text-green-600">{stats.totalTeams}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Total Questions</p>
              <p className="text-3xl font-bold text-purple-600">{stats.totalQuestions}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Accuracy</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.accuracy}%</p>
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto">
          {/* Tabs */}
          <div className="mb-6">
            <nav className="flex space-x-4 border-b">
              <button
                onClick={() => setActiveTab('setup')}
                className={`py-3 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'setup'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Setup
              </button>
              <button
                onClick={() => setActiveTab('questions')}
                className={`py-3 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'questions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Questions
              </button>
              <button
                onClick={() => setActiveTab('qr')}
                className={`py-3 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'qr'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                QR Codes
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            {activeTab === 'setup' && <VenueManagement onUpdate={fetchStats} />}
            {activeTab === 'questions' && <QuestionUpload onUpdate={fetchStats} />}
            {activeTab === 'qr' && <QRGenerator />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;