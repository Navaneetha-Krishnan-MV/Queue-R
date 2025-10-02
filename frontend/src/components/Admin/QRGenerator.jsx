import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../utils/api';

const QRGenerator = () => {
  const [qrCodes, setQRCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await adminAPI.getQuestions();
      setQuestions(response.data);
    } catch (error) {
      console.error('Failed to fetch questions');
    }
  };

  const generateQRCodes = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await adminAPI.generateQRCodes();
      setQRCodes(response.data.qrCodes);
      setMessage('QR codes generated successfully!');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to generate QR codes');
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = (qrCodeImage, questionId) => {
    const link = document.createElement('a');
    link.href = qrCodeImage;
    link.download = `question-${questionId}-qr.png`;
    link.click();
  };

  const printAllQRCodes = () => {
    const printWindow = window.open('', '_blank');
    const qrCodesHTML = qrCodes.map(qr => `
      <div style="page-break-after: always; text-align: center; padding: 20px;">
        <h2>Question ${qr.questionId}</h2>
        <img src="${qr.qrCodeImage}" style="width: 300px; height: 300px;" />
        <p><strong>Question:</strong> ${qr.questionText}</p>
        <p style="font-size: 12px; color: #666;">Scan this QR code to answer the question</p>
      </div>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>QR Codes - Event Questions</title>
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Generate QR Codes</h2>
        <div className="text-sm text-gray-600">
          Total Questions: {questions.length}
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-md mb-4 ${
          message.includes('success') 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}

      {questions.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">No questions found.</p>
          <p className="text-sm text-gray-500">Please upload questions first before generating QR codes.</p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <button
              onClick={generateQRCodes}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 mr-4"
            >
              {loading ? 'Generating...' : 'Generate QR Codes'}
            </button>

            {qrCodes.length > 0 && (
              <button
                onClick={printAllQRCodes}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
              >
                Print All QR Codes
              </button>
            )}
          </div>

          {qrCodes.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {qrCodes.map((qr) => (
                <div key={qr.questionId} className="border border-gray-200 rounded-lg p-4">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold mb-2">
                      Question {qr.questionId}
                    </h3>
                    <img 
                      src={qr.qrCodeImage} 
                      alt={`QR Code for Question ${qr.questionId}`}
                      className="w-48 h-48 mx-auto border"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Question:</strong> {qr.questionText}
                    </p>
                    <p className="text-xs text-gray-500 break-all">
                      <strong>URL:</strong> {qr.qrUrl}
                    </p>
                  </div>

                  <button
                    onClick={() => downloadQRCode(qr.qrCodeImage, qr.questionId)}
                    className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 text-sm"
                  >
                    Download QR Code
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default QRGenerator;