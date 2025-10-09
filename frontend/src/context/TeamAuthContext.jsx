import React, { createContext, useState, useContext, useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { teamAPI } from '../utils/api';

const TeamAuthContext = createContext(null);

export const TeamAuthProvider = ({ children }) => {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing team session on initial load
    const checkTeamAuth = async () => {
      try {
        const teamData = localStorage.getItem('teamData');
        const teamId = localStorage.getItem('teamId');
        
        if (teamData && teamId) {
          // Verify team still exists by fetching fresh data
          const response = await teamAPI.getTeam(teamId);
          const freshTeamData = {
            id: response.data.id,
            teamName: response.data.teamName,
            leaderName: response.data.leaderName,
            venue: response.data.venue,
            venueId: response.data.venueId,
            score: response.data.score
          };
          
          // Update localStorage with fresh data
          localStorage.setItem('teamData', JSON.stringify(freshTeamData));
          setTeam(freshTeamData);
        }
      } catch (error) {
        console.error('Team auth check failed:', error);
        // Clear invalid session
        teamLogout();
      } finally {
        setLoading(false);
      }
    };
    
    checkTeamAuth();
  }, []);

  const teamLogin = async (teamName, registrationCode) => {
    try {
      const response = await teamAPI.login({ teamName, registrationCode });
      const teamData = response.data.team;
      
      localStorage.setItem('teamId', teamData.id);
      localStorage.setItem('teamData', JSON.stringify(teamData));
      setTeam(teamData);
      
      return { success: true };
    } catch (error) {
      console.error('Team login failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Invalid team name or registration code' 
      };
    }
  };

  const teamLogout = () => {
    localStorage.removeItem('teamId');
    localStorage.removeItem('teamData');
    setTeam(null);
  };

  const updateTeamScore = (newScore) => {
    if (team) {
      const updatedTeam = { ...team, score: newScore };
      setTeam(updatedTeam);
      localStorage.setItem('teamData', JSON.stringify(updatedTeam));
    }
  };

  return (
    <TeamAuthContext.Provider value={{ 
      team, 
      teamLogin, 
      teamLogout, 
      loading,
      updateTeamScore 
    }}>
      {!loading && children}
    </TeamAuthContext.Provider>
  );
};

export const useTeamAuth = () => {
  const context = useContext(TeamAuthContext);
  if (!context) {
    throw new Error('useTeamAuth must be used within TeamAuthProvider');
  }
  return context;
};

export const ProtectedTeamRoute = ({ children }) => {
  const { team, loading } = useTeamAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!team) {
    return <Navigate to="/team/login" state={{ from: location }} replace />;
  }

  return children;
};
