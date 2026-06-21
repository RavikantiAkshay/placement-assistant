import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Loader2, BrainCircuit, CheckCircle2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-surface">
      {/* Left Side: Branding / Marketing (Laptop Layout) */}
      <div className="hidden lg:flex w-1/2 bg-primary relative overflow-hidden flex-col justify-between p-16 text-on-primary">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-container rounded-full blur-[120px] opacity-50 translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#003b82] rounded-full blur-[100px] opacity-40 -translate-x-1/3 translate-y-1/3 pointer-events-none"></div>
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-on-primary text-primary p-2.5 rounded-xl shadow-lg">
            <BrainCircuit size={32} />
          </div>
          <span className="text-2xl font-bold tracking-tight">Placement Assistant</span>
        </div>

        <div className="relative z-10 max-w-xl">
          <h1 className="text-5xl font-bold leading-tight mb-6">
            Master your technical interviews with AI.
          </h1>
          <p className="text-lg text-primary-fixed-dim leading-relaxed mb-10">
            Practice in a realistic, pressure-free environment. Get instant, actionable feedback and land your dream job faster.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-4 text-on-primary">
              <CheckCircle2 className="text-tertiary-fixed" size={24} />
              <span className="text-lg font-medium">Real-time voice interactions</span>
            </div>
            <div className="flex items-center gap-4 text-on-primary">
              <CheckCircle2 className="text-tertiary-fixed" size={24} />
              <span className="text-lg font-medium">Personalized resume parsing</span>
            </div>
            <div className="flex items-center gap-4 text-on-primary">
              <CheckCircle2 className="text-tertiary-fixed" size={24} />
              <span className="text-lg font-medium">Comprehensive feedback reports</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm text-primary-fixed-dim font-medium">
          © {new Date().getFullYear()} Placement Assistant. All rights reserved.
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 relative overflow-hidden bg-surface-container-lowest">
        {/* Subtle background glow for right side */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="w-full max-w-md relative z-10">
          <div className="mb-10 lg:hidden flex items-center gap-3 mb-12">
            <div className="bg-primary text-on-primary p-2.5 rounded-xl shadow-md">
              <BrainCircuit size={28} />
            </div>
            <span className="text-2xl font-bold tracking-tight text-on-surface">Placement Assistant</span>
          </div>

          <div className="mb-10">
            <h2 className="text-4xl font-bold text-on-surface mb-3 tracking-tight">Welcome back</h2>
            <p className="text-on-surface-variant text-lg">Please enter your details to sign in.</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-error-container text-on-error-container p-4 rounded-xl text-sm font-medium border border-error/20 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <span className="material-symbols-outlined text-error">error</span>
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-on-surface">Email address</label>
              <input
                type="email"
                required
                className="premium-input bg-surface hover:bg-surface-container-lowest focus:bg-surface-container-lowest"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-on-surface">Password</label>
              <input
                type="password"
                required
                className="premium-input bg-surface hover:bg-surface-container-lowest focus:bg-surface-container-lowest"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary/50" />
                <span className="text-sm font-medium text-on-surface-variant group-hover:text-on-surface transition-colors">Remember for 30 days</span>
              </label>
              <a href="#" className="text-sm font-semibold text-primary hover:text-primary-container transition-colors">
                Forgot password?
              </a>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base mt-8 shadow-xl shadow-primary/20">
              {loading ? <Loader2 size={22} className="animate-spin" /> : (
                <><LogIn size={20} /> Sign In</>
              )}
            </button>
          </form>
          
          <div className="mt-10 text-center">
            <p className="text-base text-on-surface-variant font-medium">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-primary hover:text-primary-container transition-colors ml-1 underline decoration-primary/30 underline-offset-4 hover:decoration-primary">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
