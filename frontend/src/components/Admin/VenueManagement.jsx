import React, { useState } from 'react';
import { adminAPI } from '@/utils/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Building, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const VenueManagement = ({ onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  const [showResetDialog, setShowResetDialog] = useState(false);

  const handleSetupVenues = async () => {
    setLoading(true);
    setMessage({ type: '', content: '' });

    try {
      const response = await adminAPI.setupVenues();
      setMessage({ 
        type: 'success', 
        content: response.data.message 
      });
      
      toast.success('Venues have been set up successfully.');
      
      if (onUpdate) onUpdate();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to setup venues';
      setMessage({ 
        type: 'error', 
        content: errorMsg 
      });
      
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetEvent = async () => {
    setShowResetDialog(false);
    setLoading(true);
    setMessage({ type: '', content: '' });

    try {
      const response = await adminAPI.resetEvent();
      setMessage({ 
        type: 'success', 
        content: response.data.message 
      });
      
      toast.success('Event has been reset successfully.');
      
      if (onUpdate) onUpdate();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to reset event';
      setMessage({ 
        type: 'error', 
        content: errorMsg 
      });
      
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Setup Venues Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Building className="h-6 w-6 text-primary" />
            <CardTitle>Venue Setup</CardTitle>
          </div>
          <CardDescription>
            Initialize 8 venues (Venue A through Venue H) for the event.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {message.type && (
            <Alert variant={message.type === 'error' ? 'destructive' : 'default'} className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{message.content}</AlertDescription>
            </Alert>
          )}
          <Button 
            onClick={handleSetupVenues}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? 'Setting up...' : 'Setup Venues'}
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone Card */}
      <Card className="border-red-200 dark:border-red-900/50">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
          </div>
          <CardDescription className="text-red-600/80">
            Reset the entire event. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4">
              <h4 className="font-medium text-red-700 dark:text-red-300 mb-2">This will:</h4>
              <ul className="space-y-1 text-sm text-red-600 dark:text-red-400">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Clear all team attempts</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Reset all team scores to 0</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Make all questions available again in all venues</span>
                </li>
              </ul>
            </div>
            
            <Button 
              variant="destructive" 
              onClick={() => setShowResetDialog(true)}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? 'Resetting...' : 'Reset Event'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently reset the entire event, including all team progress and scores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleResetEvent}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Resetting...' : 'Reset Event'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VenueManagement;