import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Home, Play, Clock } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null; // Don't show navbar on login/register pages

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-8">
          <Link to="/" className="text-xl font-bold text-indigo-600">Natalie AI</Link>
          <div className="hidden md:flex space-x-6">
            <Link to="/" className="text-gray-600 hover:text-indigo-600 flex items-center gap-2">
              <Home size={18} /> Dashboard
            </Link>
            <Link to="/setup" className="text-gray-600 hover:text-indigo-600 flex items-center gap-2">
              <Play size={18} /> New Interview
            </Link>
            <Link to="/history" className="text-gray-600 hover:text-indigo-600 flex items-center gap-2">
              <Clock size={18} /> History
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Welcome, {user?.name || 'User'}</span>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-md transition-colors"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
