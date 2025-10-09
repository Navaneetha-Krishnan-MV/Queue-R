import React, { useState, useEffect } from 'react';
import { adminAPI } from '@/utils/api';
import VenueManagement from './VenueManagement';
import QuestionUpload from './QuestionUpload';
import QRGenerator from './QRGenerator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('setup');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  };

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="container mx-auto p-4 md:p-6 max-w-7xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Admin Dashboard</CardTitle>
            <CardDescription className="text-center">
              Manage event settings, questions, and QR codes
            </CardDescription>
          </CardHeader>
          
          {/* Statistics Overview */}
          <CardContent>
            {stats ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                  title="Total Venues" 
                  value={stats.totalVenues} 
                  icon={<Building2 className="h-5 w-5 text-blue-500" />}
                  className="border-l-4 border-blue-500"
                />
                <StatCard 
                  title="Total Teams" 
                  value={stats.totalTeams} 
                  icon={<Users className="h-5 w-5 text-green-500" />}
                  className="border-l-4 border-green-500"
                />
                <StatCard 
                  title="Total Questions" 
                  value={stats.totalQuestions} 
                  icon={<FileQuestion className="h-5 w-5 text-purple-500" />}
                  className="border-l-4 border-purple-500"
                />
                <StatCard 
                  title="Accuracy" 
                  value={`${stats.accuracy}%`} 
                  icon={<BarChart2 className="h-5 w-5 text-amber-500" />}
                  className="border-l-4 border-amber-500"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-lg" />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="setup" className="w-full">
          <div className="overflow-x-auto pb-2">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="setup">Setup</TabsTrigger>
              <TabsTrigger value="questions">Questions</TabsTrigger>
              <TabsTrigger value="qr">QR Codes</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="setup">
            <Card>
              <CardContent className="pt-6">
                <VenueManagement onUpdate={fetchStats} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="questions">
            <Card>
              <CardContent className="pt-6">
                <QuestionUpload onUpdate={fetchStats} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="qr">
            <Card>
              <CardContent className="pt-6">
                <QRGenerator />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// StatCard component for displaying statistics
const StatCard = ({ title, value, icon, className = '' }) => (
  <Card className={`p-4 ${className}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
      <div className="p-2 rounded-lg bg-muted">
        {icon}
      </div>
    </div>
  </Card>
);

export default Admin;