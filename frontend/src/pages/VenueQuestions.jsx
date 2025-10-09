import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { questionAPI } from '../utils/api';
import QuestionTimer from '../components/Team/QuestionTimer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Clock,
  Trophy,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
  Timer,
  Star,
  Zap
} from 'lucide-react';

const VenueQuestions = () => {
  const { venueId, questionId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [question, setQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [timeTaken, setTimeTaken] = useState(0);
  const teamId = localStorage.getItem('teamId');
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    if (teamId) {
      fetchQuestion();
    }
  }, [venueId, questionId, token, teamId]);

  const fetchQuestion = async () => {
    try {
      const response = await questionAPI.getQuestion(
        venueId,
        questionId,
        token,
        teamId
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
        teamId: parseInt(teamId),
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-lg font-medium">Loading question...</p>
            <p className="text-sm text-muted-foreground">Please wait while we prepare your challenge</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !question) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription className="mb-4">{error}</AlertDescription>
            </Alert>
            <Button
              onClick={() => navigate(`/QRScanner`)}
              className="w-full"
              variant="outline"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to QR Scanner
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardContent className="p-8 text-center">
            <div className={`p-6 rounded-full mx-auto mb-6 w-fit ${
              result.isCorrect
                ? 'bg-green-100 text-green-600'
                : 'bg-red-100 text-red-600'
            }`}>
              {result.isCorrect ? (
                <CheckCircle className="h-16 w-16" />
              ) : (
                <XCircle className="h-16 w-16" />
              )}
            </div>

            <h2 className={`text-3xl font-bold mb-4 ${
              result.isCorrect ? 'text-green-600' : 'text-red-600'
            }`}>
              {result.isCorrect ? 'Correct Answer!' : 'Incorrect Answer'}
            </h2>

            <p className="text-lg mb-6 text-muted-foreground">
              {result.message}
            </p>

            {result.isCorrect && (
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-center gap-2 text-lg font-semibold text-yellow-600">
                  <Trophy className="h-5 w-5" />
                  <span>Points Awarded: {result.pointsAwarded.toFixed(2)}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span>Time: {result.timeTaken}s</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Star className="h-4 w-4 text-purple-600" />
                    <span>Score: {result.teamScore.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Button
                onClick={() => navigate('/QRScanner')}
                className="w-full"
                size="lg"
              >
                <Zap className="h-4 w-4 mr-2" />
                Back to QR Scanner
              </Button>
              <Button
                onClick={() => navigate('/leaderboard')}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <Trophy className="h-4 w-4 mr-2" />
                View Leaderboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Timer Card */}
          <QuestionTimer
            timeLimit={question.timeLimit || 20}
            onTimeUp={handleTimeUp}
            isActive={timerActive}
            onTimeUpdate={handleTimeUpdate}
          />

          {/* Question Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                    <Timer className="h-6 w-6 text-blue-600" />
                    Question #{questionId}
                  </CardTitle>
                  <CardDescription className="text-base">
                    Choose your answer carefully - time is limited!
                  </CardDescription>
                </div>
                <Badge variant="outline" className="w-fit text-sm">
                  Base Points: {question.basePoints}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Question Text */}
              <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <p className="text-lg sm:text-xl font-medium text-gray-800 leading-relaxed">
                  {question.questionText}
                </p>
              </div>

              {/* Error Display */}
              {error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Options */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Select your answer:</Label>
                <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
                  {Object.entries(question.options).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value={key} id={key} />
                      <Label htmlFor={key} className="flex-1 cursor-pointer">
                        <span className="font-semibold mr-2 text-blue-600">{key}.</span>
                        <span className="text-gray-700">{value}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={submitting || !selectedOption || !timerActive}
                className="w-full"
                size="lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Submit Answer
                  </>
                )}
              </Button>

              {/* Points Information */}
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Points Formula: Base Points ({question.basePoints}) - Time Taken
                </p>
                <p className="text-xs text-gray-600">
                  Answer faster to earn more points! ⏱️
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VenueQuestions;