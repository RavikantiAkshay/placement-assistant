import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Loader2, BrainCircuit, CheckCircle2 } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register({ name, email, password });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
            Join the new era of interview preparation.
          </h1>
          <p className="text-lg text-primary-fixed-dim leading-relaxed mb-10">
            Create an account to unlock unlimited access to AI-driven mock interviews, personalized feedback, and detailed performance metrics.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-4 text-on-primary">
              <CheckCircle2 className="text-tertiary-fixed" size={24} />
              <span className="text-lg font-medium">Free and unlimited access</span>
            </div>
            <div className="flex items-center gap-4 text-on-primary">
              <CheckCircle2 className="text-tertiary-fixed" size={24} />
              <span className="text-lg font-medium">Track progress over time</span>
            </div>
            <div className="flex items-center gap-4 text-on-primary">
              <CheckCircle2 className="text-tertiary-fixed" size={24} />
              <span className="text-lg font-medium">AI-powered analytics</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm text-primary-fixed-dim font-medium">
          © {new Date().getFullYear()} Placement Assistant. All rights reserved.
        </div>
      </div>

      {/* Right Side: Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 relative overflow-hidden bg-surface-container-lowest">
        {/* Subtle background glow for right side */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="w-full max-w-md relative z-10">
          <div className="mb-10 lg:hidden flex items-center gap-3">
            <div className="bg-primary text-on-primary p-2.5 rounded-xl shadow-md">
              <BrainCircuit size={28} />
            </div>
            <span className="text-2xl font-bold tracking-tight text-on-surface">Placement Assistant</span>
          </div>

          <div className="mb-10">
            <h2 className="text-4xl font-bold text-on-surface mb-3 tracking-tight">Create an account</h2>
            <p className="text-on-surface-variant text-lg">Enter your details below to get started.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-error-container text-on-error-container p-4 rounded-xl text-sm font-medium border border-error/20 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <span className="material-symbols-outlined text-error">error</span>
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-on-surface">Full name</label>
              <input
                type="text"
                required
                className="premium-input bg-surface hover:bg-surface-container-lowest focus:bg-surface-container-lowest"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

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
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength="6"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base mt-8 shadow-xl shadow-primary/20">
              {loading ? <Loader2 size={22} className="animate-spin" /> : (
                <><UserPlus size={20} /> Create Account</>
              )}
            </button>
          </form>
          
          <div className="mt-10 text-center">
            <p className="text-base text-on-surface-variant font-medium">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-primary hover:text-primary-container transition-colors ml-1 underline decoration-primary/30 underline-offset-4 hover:decoration-primary">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
