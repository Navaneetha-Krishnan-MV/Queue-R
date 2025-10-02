import React, { useState } from 'react';
import QuestionUpload from '../components/Admin/QuestionUpload.jsx';
import QRGenerator from '../components/Admin/QRGenerator.jsx';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('upload');

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Admin Dashboard</h1>
        
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('upload')}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === 'upload'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Upload Questions
              </button>
              <button
                onClick={() => setActiveTab('qr')}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === 'qr'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Generate QR Codes
              </button>
            </nav>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            {activeTab === 'upload' && <QuestionUpload />}
            {activeTab === 'qr' && <QRGenerator />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;