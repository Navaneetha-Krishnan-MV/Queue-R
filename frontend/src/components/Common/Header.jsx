import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTeamAuth } from '../../context/TeamAuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Home, 
  Trophy, 
  LogIn, 
  LogOut, 
  Settings, 
  Users, 
  Menu,
  ScanQrCode
} from 'lucide-react';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { team, teamLogout } = useTeamAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleAdminLogout = () => {
    logout();
    navigate('/admin/login');
    setMobileMenuOpen(false);
  };

  const handleTeamLogout = () => {
    teamLogout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const NavigationLink = ({ to, children, icon: Icon, mobile = false }) => {
    const active = isActive(to);
    if (mobile) {
      return (
        <Link
          to={to}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            active
              ? 'bg-blue-100 text-blue-600'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
          }`}
          onClick={() => setMobileMenuOpen(false)}
        >
          <Icon className="h-4 w-4" />
          {children}
        </Link>
      );
    }

    return (
      <Link
        to={to}
        className={`text-sm font-medium transition-colors ${
          active
            ? 'text-blue-600'
            : 'text-gray-700 hover:text-blue-600'
        }`}
      >
        {children}
      </Link>
    );
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2 text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ScanQrCode className="h-6 w-6" />
            <span>QR Challenge</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <NavigationLink to="/">
              Home
            </NavigationLink>
            <NavigationLink to="/leaderboard">
              Leaderboard
            </NavigationLink>

            {/* Team Auth Section */}
            {team ? (
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="flex items-center gap-2">
                  <Users className="h-3 w-3" />
                  {team.teamName}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTeamLogout}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Team Logout
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <Link to="/team/login" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Team Login
                </Link>
              </Button>
            )}

            {/* Admin Section */}
            <Separator orientation="vertical" className="h-6" />
            
            {user ? (
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <Link to="/admin" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Admin Panel
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAdminLogout}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Admin Logout
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <Link to="/admin/login" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Admin
                </Link>
              </Button>
            )}
          </nav>

          {/* Mobile Menu Trigger */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="md:hidden"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] p-5">
              <div className="flex flex-col gap-6">
                {/* Logo in Mobile Menu */}
                <div className="flex items-center gap-2 text-lg font-bold text-blue-600">
                  <ScanQrCode className="h-5 w-5" />
                  QR Challenge
                </div>

                <Separator />

                {/* Main Navigation */}
                <div className="flex flex-col gap-2">
                  <NavigationLink to="/" icon={Home} mobile>
                    Home
                  </NavigationLink>
                  <NavigationLink to="/leaderboard" icon={Trophy} mobile>
                    Leaderboard
                  </NavigationLink>
                </div>

                <Separator />

                {/* Team Section */}
                <div className="flex flex-col gap-3">
                  <h3 className="text-sm font-medium text-gray-500">Team</h3>
                  {team ? (
                    <>
                      <div className="flex items-center gap-2 px-3 py-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium">{team.teamName}</span>
                        <Badge variant="secondary" className="ml-auto">
                          Team
                        </Badge>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleTeamLogout}
                        className="justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Team Logout
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="justify-start"
                    >
                      <Link 
                        to="/team/login"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <LogIn className="h-4 w-4 mr-2" />
                        Team Login
                      </Link>
                    </Button>
                  )}
                </div>

                <Separator />

                {/* Admin Section */}
                <div className="flex flex-col gap-3">
                  <h3 className="text-sm font-medium text-gray-500">Admin</h3>
                  {user ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="justify-start"
                      >
                        <Link 
                          to="/admin"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Admin Panel
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAdminLogout}
                        className="justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Admin Logout
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="justify-start"
                    >
                      <Link 
                        to="/admin/login"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Admin Login
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;