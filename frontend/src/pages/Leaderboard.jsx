import React, { useState, useEffect, useCallback } from 'react';
import { leaderboardAPI } from '../utils/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Trophy,
  Users,
  Target,
  Medal,
  RefreshCw,
  Crown,
  Award,
  MapPin,
  TrendingUp,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('global'); // global or venue

  const fetchData = useCallback(async () => {
    try {
      await Promise.all([fetchLeaderboard(), fetchStats()]);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Set up polling every 5 seconds
    const intervalId = setInterval(fetchData, 5000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [fetchData]);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const response = await leaderboardAPI.getGlobal();
      setLeaderboard(response.data);
      return response.data;
    } catch (error) {
      setError('Failed to load leaderboard');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await leaderboardAPI.getStats();
      setStats(response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to load stats:', error);
      throw error;
    }
  }, []);

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={`text-2xl sm:text-3xl font-bold ${color}`}>
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const VenueCard = ({ venue }) => (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-blue-100 rounded-full">
            <MapPin className="h-4 w-4 text-blue-600" />
          </div>
          <h3 className="font-semibold text-lg">{venue.venueName}</h3>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <p className="text-muted-foreground">Teams</p>
            <p className="font-bold text-lg text-blue-600">{venue.teamsCount}</p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground">Solved</p>
            <p className="font-bold text-lg text-green-600">{venue.expiredQuestions}</p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground">Available</p>
            <p className="font-bold text-lg text-purple-600">{venue.activeQuestions}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-lg font-medium">Loading leaderboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <Card className="shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-2">
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white p-3 rounded-full">
                  <Trophy className="h-8 w-8" />
                </div>
              </div>
              <CardTitle className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                Global Leaderboard
              </CardTitle>
              <CardDescription className="text-base sm:text-lg">
                Real-time rankings across all venues • Updates every 5 seconds
              </CardDescription>
            </CardHeader>
          </Card>


          {/* Leaderboard */}
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
                  <Medal className="h-6 w-6 text-yellow-600" />
                  Team Rankings
                </CardTitle>
                <Button
                  onClick={fetchData}
                  variant="outline"
                  size="sm"
                  className="w-fit"
                  >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {leaderboard.length === 0 ? (
                <div className="p-8 text-center">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      No teams have registered yet. Be the first to join the competition!
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                        <th className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wider rounded-tl-lg">
                          Rank
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                          Team Name
                        </th>
                        
                      
                        <th className="px-4 py-3 text-right text-sm font-semibold uppercase tracking-wider rounded-tr-lg">
                          Score
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {leaderboard.map((team, index) => {
                        const getRowStyle = (rank) => {
                          switch (rank) {
                            case 1:
                              return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-l-4 border-yellow-400 hover:from-yellow-100 hover:to-yellow-150';
                              case 2:
                                return 'bg-gradient-to-r from-gray-50 to-gray-100 border-l-4 border-gray-400 hover:from-gray-100 hover:to-gray-150';
                                case 3:
                                  return 'bg-gradient-to-r from-amber-50 to-amber-100 border-l-4 border-amber-600 hover:from-amber-100 hover:to-amber-150';
                            default:
                              return 'bg-white hover:bg-gray-50';
                            }
                        };

                        const getRankIcon = (rank) => {
                          switch (rank) {
                            case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
                            case 2: return <Medal className="h-5 w-5 text-gray-400" />;
                            case 3: return <Award className="h-5 w-5 text-amber-600" />;
                            default: return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
                          }
                        };
                        
                        return (
                          <tr
                          key={team.teamId}
                          className={`${getRowStyle(team.rank)} transition-colors`}
                          >
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                {getRankIcon(team.rank)}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-semibold ${index < 3 ? 'text-gray-900' : 'text-gray-700'}`}>
                                  {team.teamName}
                                </span>
                                {index < 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    Top {team.rank}
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-right">
                              <Badge
                                variant={index < 3 ? "default" : "secondary"}
                                className={`text-sm font-bold px-3 py-1 ${
                                  index < 3 ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' : ''
                                }`}
                                >
                                {team.score.toFixed(3)} pts
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
              {/* Statistics Cards */}
              {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    title="Total Teams"
                    value={stats.totalTeams}
                    icon={Users}
                    color="text-blue-600"
                  />
                  <StatCard
                    title="Total Attempts"
                    value={stats.totalAttempts}
                    icon={Target}
                    color="text-purple-600"
                  />
                  <StatCard
                    title="Global Accuracy"
                    value={`${stats.accuracy}%`}
                    icon={TrendingUp}
                    color="text-green-600"
                  />
                  <StatCard
                    title="Leading Team"
                    value={stats.topTeam?.teamName || 'N/A'}
                    icon={Crown}
                    color="text-yellow-600"
                    subtitle={`${stats.topTeam?.score || 0} points`}
                  />
                </div>
              )}

          {/* Venue Statistics */}
          {stats && stats.venues && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <MapPin className="h-6 w-6 text-blue-600" />
                  Venue Statistics
                </CardTitle>
                <CardDescription>
                  Real-time status of all competition venues
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {stats.venues.map((venue) => (
                    <VenueCard key={venue.venueName} venue={venue} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;