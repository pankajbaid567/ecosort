import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  BookOpen, 
  BarChart3, 
  Trophy, 
  Map, 
  User, 
  LogOut, 
  LogIn,
  Award,
  Plus,
  MapPin,
  Gem,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    {
      path: '/waste-guide',
      label: 'Waste Guide',
      icon: BookOpen,
      public: true,
    },
    {
      path: '/points-tracker',
      label: 'Track Points',
      icon: Plus,
      protected: true,
    },
    {
      path: '/bin-map',
      label: 'Bin Map',
      icon: MapPin,
      public: true,
    },
    {
      path: '/valuable-guide',
      label: 'Valuable Items',
      icon: Gem,
      public: true,
    },
    {
      path: '/scrap-prices',
      label: 'Scrap Prices',
      icon: DollarSign,
      public: true,
    },
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      protected: true,
    },
    {
      path: '/leaderboard',
      label: 'Leaderboard',
      icon: Trophy,
      public: true,
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/waste-guide');
    setIsMobileMenuOpen(false);
  };

  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-eco border-b border-eco-green/10 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/waste-guide" 
            className="flex items-center gap-2 text-2xl font-bold text-eco-dark hover:text-eco-green transition-colors"
          >
            <span className="text-3xl">🌱</span>
            EcoSort
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems
              .filter(item => item.public || (item.protected && isAuthenticated))
              .map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`nav-link flex items-center gap-2 ${
                      isActive ? 'active' : ''
                    }`}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
          </nav>

          {/* User Menu / Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                {/* User Points */}
                <div className="flex items-center gap-1 text-eco-yellow">
                  <Award size={18} />
                  <span className="font-semibold">{user?.points || 0}</span>
                </div>

                {/* User Profile Dropdown */}
                <div className="relative group">
                  <button className="flex items-center gap-2 text-eco-dark hover:text-eco-green transition-colors">
                    <User size={18} />
                    <span className="font-medium">{user?.name || 'User'}</span>
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-eco shadow-eco-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-2">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-eco-dark hover:bg-eco-green hover:bg-opacity-10 hover:text-eco-green transition-colors"
                        onClick={handleNavClick}
                      >
                        My Profile
                      </Link>
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-sm text-eco-dark hover:bg-eco-green hover:bg-opacity-10 hover:text-eco-green transition-colors"
                        onClick={handleNavClick}
                      >
                        My Dashboard
                      </Link>
                      <hr className="my-2" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link 
                  to="/login" 
                  className="btn-outline flex items-center gap-2"
                >
                  <LogIn size={18} />
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="btn-primary flex items-center gap-2"
                >
                  <User size={18} />
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-eco-dark hover:text-eco-green transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-2">
            {/* Navigation Items */}
            {navigationItems
              .filter(item => item.public || (item.protected && isAuthenticated))
              .map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={handleNavClick}
                    className={`flex items-center gap-3 px-2 py-3 rounded-eco transition-colors ${
                      isActive 
                        ? 'bg-eco-green bg-opacity-10 text-eco-green' 
                        : 'text-eco-dark hover:bg-eco-green hover:bg-opacity-5'
                    }`}
                  >
                    <Icon size={20} />
                    {item.label}
                  </Link>
                );
              })}

            {/* User Section */}
            {isAuthenticated ? (
              <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
                <div className="flex items-center justify-between px-2 py-2">
                  <span className="text-eco-dark font-medium">{user?.name}</span>
                  <div className="flex items-center gap-1 text-eco-yellow">
                    <Award size={16} />
                    <span className="font-semibold">{user?.points || 0}</span>
                  </div>
                </div>
                
                <Link
                  to="/profile"
                  onClick={handleNavClick}
                  className="flex items-center gap-3 px-2 py-3 text-eco-dark hover:bg-eco-green hover:bg-opacity-5 rounded-eco transition-colors"
                >
                  <User size={20} />
                  My Profile
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-2 py-3 text-red-600 hover:bg-red-50 rounded-eco transition-colors"
                >
                  <LogOut size={20} />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="border-t border-gray-200 pt-4 mt-4 space-y-3">
                <Link
                  to="/login"
                  onClick={handleNavClick}
                  className="btn-outline w-full flex items-center justify-center gap-2"
                >
                  <LogIn size={18} />
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={handleNavClick}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <User size={18} />
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
