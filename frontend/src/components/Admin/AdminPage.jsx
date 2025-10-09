import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../utils/api';
import VenueManagement from './VenueManagement';
import QuestionUpload from './QuestionUpload';
import QRGenerator from './QRGenerator';
import { Copy, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LogOut, Settings, FileText, QrCode, Key, Users, MapPin, Brain, Target } from 'lucide-react';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('setup');
  const [stats, setStats] = useState(null);
  const [codes, setCodes] = useState([]);
  const [codeStats, setCodeStats] = useState({ total_codes: 0, available_codes: 0, used_codes: 0 });
  const [showCodeGenerator, setShowCodeGenerator] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
    fetchCodes();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats');
      if (error.response?.status === 401) {
        logout();
        navigate('/admin/login');
      }
    }
  };

  const fetchCodes = async () => {
    try {
      const response = await adminAPI.getRegistrationCodes();
      setCodes(response.data.codes);
      setCodeStats(response.data.stats);
    } catch (error) {
      console.error('Failed to fetch registration codes');
    }
  };

  const handleGenerateCodes = async (count, prefix) => {
    setLoading(true);
    setError('');
    try {
      await adminAPI.generateRegistrationCodes({ count, prefix });
      setShowCodeGenerator(false);
      fetchCodes();
    } catch (error) {
      setError('Failed to generate codes');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCode = async (codeId) => {
    try {
      await adminAPI.deleteRegistrationCode(codeId);
      fetchCodes();
    } catch (error) {
      console.error('Failed to delete code');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={`text-3xl font-bold ${color} mt-2`}>{value}</p>
          </div>
          <div className={`p-3 rounded-full ${color.replace('text-', 'bg-')} bg-opacity-10`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const CodeItem = ({ code }) => (
    <Card className={code.isUsed ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <code className="font-mono text-lg font-semibold">{code.code}</code>
            {code.isUsed && (
              <Badge variant="destructive" className="text-xs">
                Used by {code.usedBy?.teamName}
              </Badge>
            )}
            {!code.isUsed && (
              <Badge variant="secondary" className="text-xs">
                Available
              </Badge>
            )}
          </div>
          {!code.isUsed && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeleteCode(code.id)}
              className="text-red-600 hover:text-red-800 hover:bg-red-100"
            >
              Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-2xl sm:text-3xl flex items-center gap-2">
                  <Settings className="h-6 w-6 sm:h-8 sm:w-8" />
                  Admin Dashboard
                </CardTitle>
                <CardDescription>
                  Manage venues, questions, QR codes, and registration
                </CardDescription>
              </div>
              <Button
                onClick={handleLogout}
                variant="destructive"
                size="sm"
                className="w-full sm:w-auto"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Total Venues"
              value={stats.totalVenues}
              icon={MapPin}
              color="text-blue-600"
            />
            <StatCard
              title="Total Teams"
              value={stats.totalTeams}
              icon={Users}
              color="text-green-600"
            />
            <StatCard
              title="Total Questions"
              value={stats.totalQuestions}
              icon={Brain}
              color="text-purple-600"
            />
            <StatCard
              title="Accuracy"
              value={`${stats.accuracy}%`}
              icon={Target}
              color="text-yellow-600"
            />
          </div>
        )}

        {/* Main Content */}
        <Card>
          <CardContent className="p-0 sm:p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto p-1">
                <TabsTrigger value="setup" className="flex items-center gap-2 py-3">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Setup</span>
                </TabsTrigger>
                <TabsTrigger value="questions" className="flex items-center gap-2 py-3">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Questions</span>
                </TabsTrigger>
                <TabsTrigger value="qr" className="flex items-center gap-2 py-3">
                  <QrCode className="h-4 w-4" />
                  <span className="hidden sm:inline">QR Codes</span>
                </TabsTrigger>
                <TabsTrigger value="codes" className="flex items-center gap-2 py-3">
                  <Key className="h-4 w-4" />
                  <span className="hidden sm:inline">Registration Codes</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="setup" className="p-4 sm:p-6">
                <VenueManagement onUpdate={fetchStats} />
              </TabsContent>

              <TabsContent value="questions" className="p-4 sm:p-6">
                <QuestionUpload onUpdate={fetchStats} />
              </TabsContent>

              <TabsContent value="qr" className="p-4 sm:p-6">
                <QRGenerator />
              </TabsContent>

              <TabsContent value="codes" className="p-4 sm:p-6">
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <CardTitle>Registration Codes</CardTitle>
        <CardDescription>
          Generate and manage team registration codes
        </CardDescription>
      </div>
      <Button
        onClick={() => setShowCodeGenerator(true)}
        className="w-full sm:w-auto"
      >
        <Key className="h-4 w-4 mr-2" />
        Generate Codes
      </Button>
    </div>

    {error && (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )}

    {/* Code Stats */}
    <div className="grid grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{codeStats.total_codes}</div>
          <div className="text-sm text-muted-foreground">Total Codes</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{codeStats.available_codes}</div>
          <div className="text-sm text-muted-foreground">Available</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{codeStats.used_codes}</div>
          <div className="text-sm text-muted-foreground">Used</div>
        </CardContent>
      </Card>
    </div>

    {/* Codes Table */}
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-4 font-medium">Code</th>
              <th className="text-left p-4 font-medium">Status</th>
              <th className="text-left p-4 font-medium">Used By</th>
              <th className="text-left p-4 font-medium">Generated</th>
              <th className="text-left p-4 font-medium">Used At</th>
              <th className="text-right p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {codes.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center p-8 text-muted-foreground">
                  No registration codes found. Generate some codes to get started.
                </td>
              </tr>
            ) : (
              codes.map((code) => (
                <tr key={code.id} className="hover:bg-muted/50">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <code className="bg-muted px-2 py-1 rounded font-mono text-sm">
                        {code.code}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(code.code);
                          // Optional: Add toast notification
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant={code.isUsed ? "secondary" : "default"}>
                      {code.isUsed ? "Used" : "Available"}
                    </Badge>
                  </td>
                  <td className="p-4">
                    {code.teamName ? (
                      <span className="text-sm">{code.teamName}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-muted-foreground">
                      {new Date(code.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="p-4">
                    {code.usedAt ? (
                      <span className="text-sm text-muted-foreground">
                        {new Date(code.usedAt).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      {!code.isUsed && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCode(code.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Code Generator Dialog */}
        <Dialog open={showCodeGenerator} onOpenChange={setShowCodeGenerator}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Generate Registration Codes</DialogTitle>
              <DialogDescription>
                Create new registration codes for teams to join the game.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleGenerateCodes(
                parseInt(formData.get('count')),
                formData.get('prefix')
              );
            }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="count">Number of Codes</Label>
                <Input
                  id="count"
                  name="count"
                  type="number"
                  min="1"
                  max="100"
                  defaultValue="10"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="prefix">Prefix (optional)</Label>
                <Input
                  id="prefix"
                  name="prefix"
                  type="text"
                  maxLength="10"
                  placeholder="QR"
                />
              </div>
              
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCodeGenerator(false)}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto"
                >
                  {loading ? 'Generating...' : 'Generate Codes'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminPage;