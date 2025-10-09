import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTeamAuth } from '../context/TeamAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Trophy,
  LogIn,
  Users,
  Award,
  Eye,
  ArrowRight
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const { team } = useTeamAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 text-white p-3 rounded-full">
              <Trophy className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-800 mb-6">
            Multi-Venue QR Challenge
          </h1>
          <p className="text-sm sm:text-xl text-gray-600 max-w-3xl sm:mx-auto leading-relaxed">
            Compete across 8 venues! Answer MCQ questions by scanning QR codes.
            First correct answer in your venue expires the question.
            Race against time to maximize your points!
          </p>
        </div>

        {!team ? (
          <div className="max-w-2xl mx-auto">
            <Card className="w-full shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-xl sm:text-2xl flex items-center justify-center gap-2">
                  <Award className="h-8 w-8" />
                  Welcome to QR Challenge!
                </CardTitle>
                <CardDescription className="text-sm sm:text-lg">
                  To participate, you need to login or register your team.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="flex-1">
                    <Link to="/team/login" className="flex items-center gap-2">
                      <LogIn className="h-5 w-5" />
                      Team Login
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="flex-1">
                    <Link to="/team/register" className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      <span className='text-sm sm:text-md'>Register Team</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <Card className="mt-6 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button
                    onClick={() => navigate('/QRScanner')}
                    variant="outline"
                    className="w-full py-3"
                  >
                    <Trophy className="h-5 w-5 mr-2" />
                    Open QR Scanner
                  </Button>
                  <Button
                    onClick={() => navigate('/leaderboard')}
                    variant="outline"
                    className="w-full py-3"
                  >
                    <Award className="h-5 w-5 mr-2" />
                    View Leaderboard
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card className="w-full shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl sm:text-3xl text-green-600">
                  Welcome back, {team.teamName}!
                </CardTitle>
                <CardDescription className="text-base">
                  Ready to continue your challenge?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    Access your team dashboard to view your progress and start scanning QR codes.
                  </p>

                  <Button
                    onClick={() => navigate('/team/dashboard')}
                    size="lg"
                    className="w-full sm:w-auto text-lg py-3 px-8"
                  >
                    <Eye className="h-5 w-5 mr-2" />
                    View Team Dashboard
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Team</p>
                    <p className="font-semibold text-lg">{team.teamName}</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600">Venue</p>
                    <p className="font-semibold text-lg">{team.venue}</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-gray-600">Score</p>
                    <p className="font-semibold text-lg">{team.score} pts</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;