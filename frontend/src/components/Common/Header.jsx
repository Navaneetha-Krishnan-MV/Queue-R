import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTeamAuth } from '../../context/TeamAuthContext';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { team, teamLogout } = useTeamAuth();
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleAdminLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleTeamLogout = () => {
    teamLogout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            🎯 QR Challenge
          </Link>
          
          <nav className="flex items-center space-x-6">
            <Link 
              to="/" 
              className={`text-sm font-medium ${
                isActive('/') 
                  ? 'text-blue-600' 
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/leaderboard" 
              className={`text-sm font-medium ${
                isActive('/leaderboard') 
                  ? 'text-blue-600' 
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Leaderboard
            </Link>
            
            {/* Team auth status */}
            {team ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Team: <span className="font-semibold">{team.teamName}</span>
                </span>
                <button
                  onClick={handleTeamLogout}
                  className="text-sm font-medium text-red-600 hover:text-red-700"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link 
                to="/team/login" 
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                Team Login
              </Link>
            )}

            {/* Admin section */}
            {user ? (
              <div className="flex items-center space-x-4 border-l pl-6">
                <Link 
                  to="/admin" 
                  className={`text-sm font-medium ${
                    isActive('/admin') 
                      ? 'text-blue-600' 
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  Admin Panel
                </Link>
                <button
                  onClick={handleAdminLogout}
                  className="text-sm font-medium text-red-600 hover:text-red-700"
                >
                  Admin Logout
                </button>
              </div>
            ) : (
              <Link 
                to="/admin/login" 
                className="text-sm font-medium text-gray-700 hover:text-blue-600 border-l pl-6"
              >
                Admin
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;