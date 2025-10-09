import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { venueAPI, teamAPI } from '../../utils/api';
import { useTeamAuth } from '../../context/TeamAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  UserPlus,
  Users,
  User,
  Mail,
  MapPin,
  Key,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Loader2
} from 'lucide-react';

const TeamRegistration = () => {
  const navigate = useNavigate();
  const { teamLogin } = useTeamAuth();
  const [venues, setVenues] = useState([]);
  const [formData, setFormData] = useState({
    teamName: '',
    leaderName: '',
    email: '',
    venueId: '',
    registrationCode: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      const response = await venueAPI.getAll();
      setVenues(response.data);
    } catch (error) {
      console.error('Failed to fetch venues');
      setError('Failed to load venues. Please try again.');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleVenueChange = (venueId) => {
    setFormData({
      ...formData,
      venueId,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await teamAPI.register(formData);
      setSuccess(true);

      // Auto-login after successful registration
      setTimeout(async () => {
        const loginResult = await teamLogin(formData.teamName, formData.registrationCode);
        if (loginResult.success) {
          navigate('/');
        }
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Card className="shadow-lg">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-green-600 text-white p-3 rounded-full">
                <UserPlus className="h-8 w-8" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl sm:text-3xl flex items-center justify-center gap-2">
                <Users className="h-6 w-6" />
                Team Registration
              </CardTitle>
              <CardDescription className="text-base">
                Create your team and join the competition
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  Registration successful! Logging you in...
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="teamName" className="text-sm font-medium">
                    Team Name
                  </Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="teamName"
                      name="teamName"
                      type="text"
                      value={formData.teamName}
                      onChange={handleChange}
                      required
                      placeholder="Enter team name"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="leaderName" className="text-sm font-medium">
                    Leader Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="leaderName"
                      name="leaderName"
                      type="text"
                      value={formData.leaderName}
                      onChange={handleChange}
                      required
                      placeholder="Enter leader name"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter email address"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Select Venue</Label>
                <Select value={formData.venueId} onValueChange={handleVenueChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a venue..." />
                  </SelectTrigger>
                  <SelectContent>
                    {venues.map((venue) => (
                      <SelectItem
                        key={venue.id}
                        value={String(venue.id)}
                        disabled={venue.isFull}
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{venue.venueName}</span>
                          <Badge variant="secondary" className="text-xs ml-auto">
                            {venue.teamsCount}/5
                          </Badge>
                          {venue.isFull && (
                            <Badge variant="destructive" className="text-xs">
                              FULL
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="registrationCode" className="text-sm font-medium">
                  Registration Code
                </Label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="registrationCode"
                    name="registrationCode"
                    type="text"
                    value={formData.registrationCode}
                    onChange={handleChange}
                    required
                    placeholder="Enter registration code"
                    className="pl-10"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Register Team
                  </>
                )}
              </Button>
            </form>

            <Separator />

            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link
                    to="/team/login"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Login here
                  </Link>
                </p>
              </div>

              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeamRegistration;