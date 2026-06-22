import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Home, Play, Clock, BrainCircuit } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30">
      <div className="flex items-center justify-between max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center space-x-10">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary text-on-primary shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
              <BrainCircuit size={20} />
            </div>
            <span className="text-xl font-bold text-on-surface tracking-tight">Placement Assistant</span>
          </Link>
          
          <div className="hidden md:flex space-x-2">
            <Link to="/" className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${isActive('/') ? 'bg-primary-container/20 text-primary' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'}`}>
              <Home size={18} /> Dashboard
            </Link>
            <Link to="/setup" className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${isActive('/setup') ? 'bg-primary-container/20 text-primary' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'}`}>
              <Play size={18} /> New Interview
            </Link>
            <Link to="/doubts" className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${isActive('/doubts') ? 'bg-primary-container/20 text-primary' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'}`}>
              <BrainCircuit size={18} /> Doubt Solver
            </Link>
            <Link to="/history" className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${isActive('/history') ? 'bg-primary-container/20 text-primary' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'}`}>
              <Clock size={18} /> History
            </Link>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant/50 flex items-center justify-center text-primary font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="text-sm font-medium text-on-surface hidden md:block">{user?.name}</span>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-error hover:text-on-error-container hover:bg-error-container/50 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
