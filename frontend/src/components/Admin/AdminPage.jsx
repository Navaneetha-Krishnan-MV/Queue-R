import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../utils/api';
import VenueManagement from './VenueManagement';
import QuestionUpload from './QuestionUpload';
import QRGenerator from './QRGenerator';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('setup');
  const [stats, setStats] = useState(null);
  const [codes, setCodes] = useState([]);
  const [codeStats, setCodeStats] = useState({ total_codes: 0, available_codes: 0, used_codes: 0 });
  const [showCodeGenerator, setShowCodeGenerator] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
    fetchCodes();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats');
      if (error.response?.status === 401) {
        logout();
        navigate('/admin/login');
      }
    }
  };

  const fetchCodes = async () => {
    try {
      const response = await adminAPI.getRegistrationCodes();
      setCodes(response.data.codes);
      setCodeStats(response.data.stats);
    } catch (error) {
      console.error('Failed to fetch registration codes');
    }
  };

  const handleGenerateCodes = async (count, prefix) => {
    setLoading(true);
    setError('');
    try {
      await adminAPI.generateRegistrationCodes({ count, prefix });
      setShowCodeGenerator(false);
      fetchCodes();
    } catch (error) {
      setError('Failed to generate codes');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCode = async (codeId) => {
    try {
      await adminAPI.deleteRegistrationCode(codeId);
      fetchCodes();
    } catch (error) {
      console.error('Failed to delete code');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
        
        {/* Rest of your admin dashboard code */}
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
              <button
                onClick={() => setActiveTab('codes')}
                className={`py-3 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'codes'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Registration Codes
              </button>
            </nav>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            {activeTab === 'setup' && <VenueManagement onUpdate={fetchStats} />}
            {activeTab === 'questions' && <QuestionUpload onUpdate={fetchStats} />}
            {activeTab === 'qr' && <QRGenerator />}
            {activeTab === 'codes' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Registration Codes</h2>
                  <button
                    onClick={() => setShowCodeGenerator(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                  >
                    Generate Codes
                  </button>
                </div>

                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{codeStats.total_codes}</div>
                    <div className="text-sm text-gray-600">Total Codes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{codeStats.available_codes}</div>
                    <div className="text-sm text-gray-600">Available</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{codeStats.used_codes}</div>
                    <div className="text-sm text-gray-600">Used</div>
                  </div>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {codes.map((code) => (
                    <div key={code.id} className={`p-3 rounded ${code.isUsed ? 'bg-red-50' : 'bg-green-50'}`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-mono text-lg">{code.code}</span>
                          {code.isUsed && (
                            <span className="ml-2 text-sm text-red-600">
                              Used by {code.usedBy?.teamName}
                            </span>
                          )}
                        </div>
                        {!code.isUsed && (
                          <button
                            onClick={() => handleDeleteCode(code.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Code Generator Modal */}
        {showCodeGenerator && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Generate Registration Codes</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                handleGenerateCodes(formData.get('count'), formData.get('prefix'));
              }}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Number of Codes</label>
                  <input
                    type="number"
                    name="count"
                    min="1"
                    max="100"
                    defaultValue="10"
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Prefix (optional)</label>
                  <input
                    type="text"
                    name="prefix"
                    maxLength="10"
                    placeholder="QR"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Generating...' : 'Generate'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCodeGenerator(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
