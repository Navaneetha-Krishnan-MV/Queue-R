import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { questionAPI } from '../../utils/api';

const QuestionList = () => {
  const { venueId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const teamId = localStorage.getItem('teamId');

  useEffect(() => {
    if (!teamId) {
      navigate('/', { state: { error: 'Please register first' } });
      return;
    }
    fetchQuestions();
  }, [venueId]);

  const fetchQuestions = async () => {
    try {
      const response = await questionAPI.getAvailable(venueId, teamId);
      setQuestions(response.data);
    } catch (error) {
      setError('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg">Loading questions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">Your Progress</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-3xl font-bold text-blue-600">
              {questions.availableCount}
            </p>
            <p className="text-sm text-gray-600">Available</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-green-600">
              {questions.attemptedCount}
            </p>
            <p className="text-sm text-gray-600">Attempted</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-600">
              {questions.totalQuestions}
            </p>
            <p className="text-sm text-gray-600">Total</p>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all"
              style={{ 
                width: `${(questions.attemptedCount / questions.totalQuestions) * 100}%` 
              }}
            />
          </div>
          <p className="text-center text-sm text-gray-600 mt-2">
            {Math.round((questions.attemptedCount / questions.totalQuestions) * 100)}% Complete
          </p>
        </div>
      </div>

      {/* Available Questions */}
      {questions.availableCount > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">
            Available Questions ({questions.availableCount})
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Scan the QR codes around your venue to answer these questions!
          </p>
          <div className="space-y-3">
            {questions.availableQuestions.map((q, index) => (
              <div
                key={q.questionId}
                className="p-4 border border-gray-300 rounded-lg hover:border-blue-500 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      Question {index + 1}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {q.questionText}
                    </p>
                  </div>
                  <span className="ml-4 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {q.basePoints} pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attempted Questions */}
      {questions.attemptedCount > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">
            Your Attempts ({questions.attemptedCount})
          </h3>
          <div className="space-y-3">
            {questions.attemptedQuestions.map((q, index) => (
              <div
                key={q.questionId}
                className={`p-4 border rounded-lg ${
                  q.isCorrect
                    ? 'border-green-300 bg-green-50'
                    : 'border-red-300 bg-red-50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      Question {index + 1}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {q.questionText}
                    </p>
                  </div>
                  <span className={`ml-4 px-3 py-1 rounded-full text-sm font-medium ${
                    q.isCorrect
                      ? 'bg-green-200 text-green-800'
                      : 'bg-red-200 text-red-800'
                  }`}>
                    {q.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No questions available */}
      {questions.availableCount === 0 && questions.attemptedCount === 0 && (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600">
            No questions available at the moment.
          </p>
        </div>
      )}
    </div>
  );
};

export default QuestionList;