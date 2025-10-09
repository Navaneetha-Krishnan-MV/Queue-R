import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTeamAuth } from '../../context/TeamAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Camera,
  Users,
  User,
  MapPin,
  Star,
  Clock,
  ScanLine,
  Award,
  CheckCircle2,
  AlertCircle,
  Trophy,
  ArrowLeft
} from 'lucide-react';

const TeamDashboard = () => {
  const navigate = useNavigate();
  const { team } = useTeamAuth();

  if (!team) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-lg font-medium">No team found</p>
            <p className="text-sm text-muted-foreground mb-4">Please login to view your team information</p>
            <Button onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header with QR Scanner - Positioned at top */}
          <Card className="shadow-lg border-blue-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                    Welcome back, {team.teamName}!
                  </h1>
                  <p className="text-gray-600">
                    Ready to continue the challenge?
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/QRScanner')}
                  size="lg"
                  className="w-full sm:w-auto text-lg py-3 px-8 bg-blue-600 hover:bg-blue-700"
                >
                  <Camera className="h-6 w-6 mr-2" />
                  Open QR Scanner
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Team Status Card */}
          <Card className="w-full shadow-lg">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
              <CardTitle className="text-3xl text-green-600">Team Dashboard</CardTitle>
              <CardDescription>Your current status and game information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Team</p>
                  <p className="font-bold text-lg text-blue-800">{team.teamName}</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
                  <User className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Leader</p>
                  <p className="font-bold text-lg text-green-800">{team.leaderName}</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-100">
                  <MapPin className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Venue</p>
                  <p className="font-bold text-lg text-purple-800">{team.venue}</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                  <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Score</p>
                  <p className="font-bold text-lg text-yellow-800">{team.score} points</p>
                </div>
              </div>

              <Separator className="my-6" />

              {/* How to Play */}
              <div className="mb-6">
                <h3 className="font-semibold text-xl flex items-center gap-2 mb-4">
                  <ScanLine className="h-6 w-6" />
                  How to Play
                </h3>
                <div className="grid gap-4">
                  {[
                    "Find and scan QR codes placed around your venue",
                    "Answer multiple-choice questions within 20 seconds",
                    "Earn points based on speed: Points = Base Points - Time Taken",
                    "First correct answer in your venue expires that question",
                    "One attempt per question - choose wisely!"
                  ].map((rule, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Badge variant="secondary" className="mt-0.5 text-base px-3 py-1">
                        {index + 1}
                      </Badge>
                      <span className="text-base text-gray-700">{rule}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Access Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  onClick={() => navigate('/QRScanner')}
                  variant="outline"
                  className="w-full py-3"
                >
                  <Camera className="h-5 w-5 mr-2" />
                  Open QR Scanner
                </Button>
                <Button
                  onClick={() => navigate('/leaderboard')}
                  variant="outline"
                  className="w-full py-3"
                >
                  <Trophy className="h-5 w-5 mr-2" />
                  View Leaderboard
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Game Rules Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <AlertCircle className="h-6 w-6 text-orange-600" />
                Important Rules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    icon: <MapPin className="h-5 w-5" />,
                    text: "Each venue has the same 20 questions with independent states"
                  },
                  {
                    icon: <CheckCircle2 className="h-5 w-5" />,
                    text: "Questions expire only in YOUR venue when answered correctly"
                  },
                  {
                    icon: <Clock className="h-5 w-5" />,
                    text: "You can only attempt each question once (correct or incorrect)"
                  },
                  {
                    icon: <Star className="h-5 w-5" />,
                    text: "Faster answers = More points (20 seconds max per question)"
                  },
                  {
                    icon: <Trophy className="h-5 w-5" />,
                    text: "Global leaderboard ranks teams across all 8 venues"
                  }
                ].map((rule, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="text-red-600 mt-0.5">
                      {rule.icon}
                    </div>
                    <span className="text-base text-gray-700">{rule.text}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats Alert */}
          <Alert className="border-blue-200 bg-blue-50">
            <Trophy className="h-5 w-5 text-blue-600" />
            <AlertDescription className="text-base">
              Compete against teams in your venue and across all venues! Check the leaderboard to see your ranking.
            </AlertDescription>
          </Alert>

          {/* Back to Home Button */}
          <div className="text-center">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="w-full sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamDashboard;
