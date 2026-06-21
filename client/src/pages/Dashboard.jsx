import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllInterviews, deleteInterview } from '../services/interview.service';
import { useAuth } from '../context/AuthContext';
import { Play, Target, Zap, Activity, Brain, FileText, Mic, LineChart, Code, ShieldCheck, Sparkles, Trash2 } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const data = await getAllInterviews();
        setInterviews(data);
      } catch (error) {
        console.error('Failed to fetch interviews', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInterviews();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this interview?')) {
      try {
        await deleteInterview(id);
        setInterviews(interviews.filter(i => i._id !== id));
      } catch (error) {
        console.error('Failed to delete interview', error);
        alert('Failed to delete interview');
      }
    }
  };

  const completedInterviews = interviews.filter(i => i.status === 'completed');
  const avgScore = completedInterviews.length > 0
    ? Math.round(completedInterviews.reduce((acc, curr) => acc + (curr.overallScore || 0), 0) / completedInterviews.length)
    : 0;

  return (
    <div className="max-w-[1400px] mx-auto w-full px-6 py-10 flex flex-col gap-12">
      {/* Welcome Section - Elegant & Content Rich */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-surface-container-lowest to-surface p-10 lg:p-12 border border-outline-variant/50 shadow-xl">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-extrabold text-on-surface mb-4 tracking-tight">
              Welcome to <span className="text-primary">Placement Assistant</span>
            </h1>
            <p className="text-lg text-on-surface-variant font-medium leading-relaxed mb-8 max-w-2xl">
              Your AI-powered interview preparation platform. We bridge the gap between your resume and your dream job by simulating real-world technical interviews with advanced artificial intelligence.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link to="/setup" className="btn-primary py-3.5 px-8 font-bold shadow-lg shadow-primary/20 hover:-translate-y-1 transition-transform flex items-center gap-2">
                <Play size={20} className="fill-current" /> Start New Interview
              </Link>
              <Link to="/history" className="btn-secondary py-3.5 px-8 font-bold hover:bg-surface-container-high transition-colors">
                View Past Reports
              </Link>
            </div>
          </div>
          
          <div className="hidden lg:flex shrink-0 w-48 h-48 bg-primary-container/30 rounded-full items-center justify-center relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-50" style={{ animationDuration: '3s' }}></div>
            <Brain size={80} className="text-primary relative z-10" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex items-center gap-5 border border-outline-variant/30 hover:border-outline-variant/60 transition-colors shadow-sm">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Target size={28} />
          </div>
          <div>
            <p className="text-sm text-on-surface-variant font-bold uppercase tracking-wider mb-1">Total Sessions</p>
            <p className="text-3xl font-black text-on-surface">{interviews.length}</p>
          </div>
        </div>
        
        <div className="glass-card p-6 flex items-center gap-5 border border-outline-variant/30 hover:border-outline-variant/60 transition-colors shadow-sm">
          <div className="w-14 h-14 rounded-xl bg-[#00855b]/10 flex items-center justify-center text-[#00855b]">
            <Zap size={28} />
          </div>
          <div>
            <p className="text-sm text-on-surface-variant font-bold uppercase tracking-wider mb-1">Completed</p>
            <p className="text-3xl font-black text-on-surface">{completedInterviews.length}</p>
          </div>
        </div>

        <div className="glass-card p-6 flex items-center gap-5 border border-outline-variant/30 hover:border-outline-variant/60 transition-colors shadow-sm">
          <div className="w-14 h-14 rounded-xl bg-[#5b21b6]/10 flex items-center justify-center text-[#5b21b6]">
            <Activity size={28} />
          </div>
          <div>
            <p className="text-sm text-on-surface-variant font-bold uppercase tracking-wider mb-1">Average Score</p>
            <p className="text-3xl font-black text-on-surface">{avgScore}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: How it Works & Features (Takes up 2/3 space) */}
        <div className="lg:col-span-2 flex flex-col gap-10">
          
          {/* How It Works Section */}
          <div className="glass-card p-8 border border-outline-variant/30">
            <h2 className="text-2xl font-bold text-on-surface mb-8 flex items-center gap-3">
              <Sparkles size={24} className="text-primary" /> How Placement Assistant Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-on-surface font-black shrink-0 border-2 border-outline-variant/50">1</div>
                <div>
                  <h3 className="font-bold text-lg text-on-surface flex items-center gap-2 mb-2"><FileText size={18} className="text-primary"/> Upload Resume</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">Provide your PDF resume and target role. Our AI instantly parses your experience to generate highly personalized, context-aware interview questions.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-on-surface font-black shrink-0 border-2 border-outline-variant/50">2</div>
                <div>
                  <h3 className="font-bold text-lg text-on-surface flex items-center gap-2 mb-2"><Brain size={18} className="text-primary"/> Agent AI Analysis</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">The system configures a dynamic interviewer persona based on the difficulty level (Beginner to Expert) to challenge your technical and behavioral skills.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-on-surface font-black shrink-0 border-2 border-outline-variant/50">3</div>
                <div>
                  <h3 className="font-bold text-lg text-on-surface flex items-center gap-2 mb-2"><Mic size={18} className="text-primary"/> Live Voice Session</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">Interact using your microphone. Experience realistic conversational delays, follow-up questions, and real-time speech-to-text processing.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-on-surface font-black shrink-0 border-2 border-outline-variant/50">4</div>
                <div>
                  <h3 className="font-bold text-lg text-on-surface flex items-center gap-2 mb-2"><LineChart size={18} className="text-primary"/> Actionable Feedback</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">Receive a comprehensive report card with scoring, detailed critiques of your answers, and specific areas for improvement before your real interview.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Features Section */}
          <div className="glass-card p-8 border border-outline-variant/30">
            <h2 className="text-2xl font-bold text-on-surface mb-6">Under the Hood</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/20">
                <Code size={24} className="text-primary mb-3" />
                <h4 className="font-bold text-on-surface mb-2">Powered by Groq</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">Utilizing ultra-fast Llama 3 models via Groq API for near-instantaneous, intelligent conversational responses.</p>
              </div>
              <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/20">
                <Mic size={24} className="text-[#00855b] mb-3" />
                <h4 className="font-bold text-on-surface mb-2">Web Speech API</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">Native browser integration for seamless, plugin-free voice recognition and text-to-speech capabilities.</p>
              </div>
              <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/20">
                <ShieldCheck size={24} className="text-[#b45309] mb-3" />
                <h4 className="font-bold text-on-surface mb-2">Secure & Private</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">Your resume data is processed securely and temporarily strictly for the purpose of generating your unique session.</p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Recent Activity Table (Takes up 1/3 space) */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 border border-outline-variant/30 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-on-surface">Recent Activity</h2>
              {interviews.length > 0 && (
                <Link to="/history" className="text-sm font-bold text-primary hover:underline">
                  View All
                </Link>
              )}
            </div>
            
            <div className="flex-1">
              {loading ? (
                <div className="h-full flex items-center justify-center text-on-surface-variant text-sm font-medium">Loading activity...</div>
              ) : interviews.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-outline-variant/50 rounded-2xl bg-surface-container-lowest/50">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                    <Target size={24} />
                  </div>
                  <p className="text-on-surface font-bold mb-2">No interviews yet</p>
                  <p className="text-sm text-on-surface-variant mb-6">Your recent sessions will appear here.</p>
                  <Link to="/setup" className="btn-primary py-2 px-6 text-sm">Start Now</Link>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {interviews.slice(0, 5).map(interview => (
                    <div key={interview._id} className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 hover:border-primary/30 transition-colors flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-on-surface capitalize">{interview.role}</p>
                          <p className="text-xs text-on-surface-variant capitalize mt-0.5">{interview.difficulty} Level</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wide ${
                            interview.status === 'completed' ? 'bg-[#00855b]/10 text-[#00855b]' : 'bg-[#b45309]/10 text-[#b45309]'
                          }`}>
                            {interview.status}
                          </span>
                          <button 
                            onClick={() => handleDelete(interview._id)}
                            className="text-outline-variant hover:text-error transition-colors p-1"
                            title="Delete Interview"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-outline-variant/20">
                        <span className="text-xs text-on-surface-variant font-medium">
                          {new Date(interview.createdAt).toLocaleDateString()}
                        </span>
                        <Link 
                          to={interview.status === 'completed' ? `/feedback/${interview._id}` : `/interview/${interview._id}`} 
                          className="text-primary hover:text-primary-container text-xs font-bold flex items-center gap-1"
                        >
                          {interview.status === 'completed' ? 'View Report' : 'Resume'} <Play size={12} className="fill-current"/>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
