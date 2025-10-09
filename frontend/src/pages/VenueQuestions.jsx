import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { questionAPI } from '../utils/api';
import { useTeamAuth } from '../context/TeamAuthContext';
import QuestionTimer from '../components/Team/QuestionTimer';

const VenueQuestions = () => {
  const { venueId, questionId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const { team } = useTeamAuth();

  const [question, setQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [timeTaken, setTimeTaken] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    if (team) {
      fetchQuestion();
    }
  }, [venueId, questionId, token, team]);

  const fetchQuestion = async () => {
    try {
      const response = await questionAPI.getQuestion(
        venueId,
        questionId,
        token,
        team.id
      );
      console.log('Question data received:', response.data);
      console.log('timeLimit value:', response.data.timeLimit);
      setQuestion(response.data);
      setTimerActive(true);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to load question');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeUpdate = (elapsed) => {
    setTimeTaken(elapsed);
  };

  const handleTimeUp = async () => {
    console.log('handleTimeUp called - timer expired');
    setTimerActive(false);
    if (!result) {
      // Submit empty answer (wrong by default) when time runs out
      setSelectedOption('');

      // Calculate exact time when timer expired
      const timeWhenExpired = question.timeLimit || 20; // This should be the max time (20 seconds)

      console.log('Submitting timeout answer');
      await handleSubmit(null, true, timeWhenExpired);
      console.log('Timeout answer submitted successfully');
    }
  };

  const handleSubmit = async (e, isTimeUp = false, timeWhenExpired = null) => {
    if (e) e.preventDefault();
    if (!selectedOption && !isTimeUp) {
      setError('Please select an option');
      return;
    }

    console.log('handleSubmit called with:', {
      selectedOption,
      isTimeUp,
      timeWhenExpired,
      timeTaken,
      teamId,
      venueId,
      questionId,
      token
    });

    setSubmitting(true);
    setTimerActive(false);
    setError('');

    try {
      console.log('Making API call to submit answer...');
      const response = await questionAPI.submitAnswer(venueId, questionId, {
        teamId: parseInt(team.id),
        chosenOption: selectedOption,
        timeTaken: timeWhenExpired || timeTaken,
        token,
        notAttempted: isTimeUp,
        isTimeout: isTimeUp,
        submissionType: isTimeUp ? 'timeout' : 'manual',
        submittedAt: new Date().toISOString()
      });

      console.log('API response received:', response.data);
      setResult(response.data);
    } catch (error) {
      console.error('API call failed:', error);
      console.error('Error response:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to submit answer');
      setTimerActive(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading question...</div>
      </div>
    );
  }

  if (error && !question) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
          <button
            onClick={() => navigate(`/venue/${venueId}/questions`)}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Back to Questions
          </button>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <div className={`p-6 rounded-lg ${
            result.isCorrect
              ? 'bg-green-100 border border-green-400 text-green-700'
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
            <div className="text-6xl mb-4">
              {result.isCorrect ? '🎉' : '❌'}
            </div>
            <h2 className="text-2xl font-bold mb-4">
              {result.isCorrect ? 'Correct Answer!' : 'Incorrect Answer'}
            </h2>
            <p className="text-lg mb-4">{result.message}</p>

            {result.isCorrect && (
              <>
                <p className="font-medium text-xl mb-2">
                  Points Awarded: {result.pointsAwarded}
                </p>
                <p className="text-sm">
                  Time Taken: {result.timeTaken} seconds
                </p>
                <p className="text-sm">
                  Total Score: {result.teamScore}
                </p>
              </>
            )}
          </div>

          <div className="mt-6 space-y-3">
            <button
              onClick={() => navigate(`/QRScanner`)}
              className="w-full bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              Back to QRScanner
            </button>
            <button
              onClick={() => navigate('/leaderboard')}
              className="w-full bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700"
            >
              View Leaderboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Timer */}
          <div className="mb-6">
            <QuestionTimer
              timeLimit={question.timeLimit || 20}
              onTimeUp={handleTimeUp}
              isActive={timerActive}
              onTimeUpdate={handleTimeUpdate}
            />
          </div>

          {/* Question */}
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">
              Question #{questionId}
            </h2>
            <p className="text-lg mb-4">{question.questionText}</p>
            <p className="text-sm text-gray-600">
              Base Points: {question.basePoints} (Time bonus applies)
            </p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Options */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {Object.entries(question.options).map(([key, value]) => (
              <label
                key={key}
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedOption === key
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-300'
                }`}
              >
                <input
                  type="radio"
                  name="option"
                  value={key}
                  checked={selectedOption === key}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  className="mr-3 w-5 h-5 text-blue-600"
                />
                <span className="flex-1">
                  <span className="font-semibold mr-2">{key}.</span>
                  {value}
                </span>
              </label>
            ))}

            <button
              type="submit"
              disabled={submitting || !selectedOption || !timerActive}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
            >
              {submitting ? 'Submitting...' : 'Submit Answer'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Points Formula: Base Points ({question.basePoints}) - Time Taken
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Faster answers earn more points!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueQuestions;