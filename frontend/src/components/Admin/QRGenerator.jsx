import React, { useState, useEffect } from 'react';
import { adminAPI, venueAPI } from '../../utils/api';

const QRGenerator = () => {
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState('');
  const [qrCodes, setQRCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

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

  const generateQRForVenue = async () => {
    if (!selectedVenue) {
      setMessage('❌ Please select a venue');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await adminAPI.getQRCodes(selectedVenue);
      setQRCodes(response.data.qrCodes);
      setMessage(`✅ ${response.data.message}`);
    } catch (error) {
      setMessage(`❌ ${error.response?.data?.message || 'Failed to generate QR codes'}`);
    } finally {
      setLoading(false);
    }
  };

  const generateAllQR = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await adminAPI.getAllQRCodes();
      setMessage(`✅ Generated QR codes for all venues`);
      // You could display all QR codes here if needed
    } catch (error) {
      setMessage(`❌ ${error.response?.data?.message || 'Failed to generate QR codes'}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = (qrCodeImage, venueName, questionId) => {
    const link = document.createElement('a');
    link.href = qrCodeImage;
    link.download = `${venueName}-Q${questionId}.png`;
    link.click();
  };

  const printQRCodes = () => {
    const printWindow = window.open('', '_blank');
    const qrCodesHTML = qrCodes.map(qr => `
      <div style="page-break-after: always; text-align: center; padding: 20px;">
        <h2>${qr.venueName} - Question ${qr.questionId}</h2>
        <img src="${qr.qrCodeImage}" style="width: 300px; height: 300px;" />
        <p><strong>Question:</strong> ${qr.questionText}</p>
      </div>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>QR Codes - ${qrCodes[0]?.venueName}</title>
          <style>
            body { font-family: Arial, sans-serif; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${qrCodesHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Generate QR Codes</h2>

      {message && (
        <div className={`p-4 rounded-md mb-4 ${
          message.includes('✅') 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Venue
          </label>
          <div className="flex gap-3">
            <select
              value={selectedVenue}
              onChange={(e) => setSelectedVenue(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a venue...</option>
              {venues.map(venue => (
                <option key={venue.id} value={venue.id}>
                  {venue.venueName}
                </option>
              ))}
            </select>
            <button
              onClick={generateQRForVenue}
              disabled={loading || !selectedVenue}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={generateAllQR}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Generating All...' : 'Generate All Venues'}
          </button>

          {qrCodes.length > 0 && (
            <button
              onClick={printQRCodes}
              className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700"
            >
              Print QR Codes
            </button>
          )}
        </div>
      </div>

      {qrCodes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {qrCodes.map((qr, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="text-center mb-3">
                <h3 className="text-lg font-semibold">
                  {qr.venueName} - Q{qr.questionId}
                </h3>
                <img 
                  src={qr.qrCodeImage} 
                  alt={`QR Code ${qr.questionId}`}
                  className="w-48 h-48 mx-auto my-3 border"
                />
              </div>
              
              <div className="mb-3">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Question:</strong> {qr.questionText}
                </p>
              </div>

              <button
                onClick={() => downloadQRCode(qr.qrCodeImage, qr.venueName, qr.questionId)}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 text-sm"
              >
                Download
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QRGenerator;