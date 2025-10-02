import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { questionAPI } from '../utils/api';

const Question = () => {
  const { questionId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const teamId = localStorage.getItem('teamId');

  useEffect(() => {
    fetchQuestion();
  }, [questionId, token]);

  const fetchQuestion = async () => {
    try {
      const response = await questionAPI.getQuestion(questionId, token);
      setQuestion(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to load question');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!teamId) {
      setError('Please register your team first');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await questionAPI.submitAnswer(questionId, {
        teamId,
        answer,
        token
      });
      
      setResult(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg">Loading question...</div>
      </div>
    );
  }

  if (error && !question) {
    return (
      <div className="max-w-md mx-auto bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p className="font-medium">Error:</p>
        <p>{error}</p>
      </div>
    );
  }

  if (result) {
    return (
      <div className="max-w-md mx-auto text-center">
        <div className={`p-6 rounded-lg ${
          result.isCorrect 
            ? 'bg-green-100 border border-green-400 text-green-700' 
            : 'bg-red-100 border border-red-400 text-red-700'
        }`}>
          <h2 className="text-2xl font-bold mb-4">
            {result.isCorrect ? '🎉 Correct!' : '❌ Incorrect'}
          </h2>
          <p className="text-lg mb-4">{result.message}</p>
          {result.isCorrect && (
            <p className="font-medium">Points awarded: {result.pointsAwarded}</p>
          )}
          {!result.isCorrect && result.correctAnswer && (
            <p>Correct answer: {result.correctAnswer}</p>
          )}
        </div>
        <button
          onClick={() => window.location.href = '/leaderboard'}
          className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
        >
          View Leaderboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6">
        Question #{question.questionId}
      </h2>
      
      <div className="mb-6">
        <p className="text-lg mb-4">{question.questionText}</p>
        <p className="text-sm text-gray-600">Points: {question.points}</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your Answer
          </label>
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your answer..."
          />
        </div>

        <button
          type="submit"
          disabled={submitting || !answer.trim()}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Submitting...' : 'Submit Answer'}
        </button>
      </form>
    </div>
  );
};

export default Question;