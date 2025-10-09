import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTeamAuth } from '../../context/TeamAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  LogIn,
  Users,
  Key,
  AlertCircle,
  ArrowLeft,
  Settings
} from 'lucide-react';

const TeamLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { teamLogin } = useTeamAuth();

  const [formData, setFormData] = useState({
    teamName: '',
    registrationCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await teamLogin(formData.teamName, formData.registrationCode);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-blue-600 text-white p-3 rounded-full">
                <LogIn className="h-8 w-8" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl sm:text-3xl flex items-center justify-center gap-2">
                <Users className="h-6 w-6" />
                Team Login
              </CardTitle>
              <CardDescription className="text-base">
                Enter your team credentials to continue
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

            <form onSubmit={handleSubmit} className="space-y-4">
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
                    placeholder="Enter your team name"
                    className="pl-10"
                  />
                </div>
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
                    placeholder="Enter your registration code"
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
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                  </>
                )}
              </Button>
            </form>

            <Separator />

            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <Link
                    to="/team/register"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Register here
                  </Link>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="flex-1"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>

                <Button
                  variant="outline"
                  asChild
                  className="flex-1"
                >
                  <Link to="/admin/login">
                    <Settings className="h-4 w-4 mr-2" />
                    Admin Login
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeamLogin;
