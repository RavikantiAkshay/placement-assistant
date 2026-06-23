import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllInterviews, deleteInterview } from '../services/interview.service';
import { useAuth } from '../context/AuthContext';
import { Play, Target, Zap, Activity, Brain, FileText, Mic, LineChart, Code, ShieldCheck, Sparkles, Trash2, Camera, MessageSquare, History as HistoryIcon } from 'lucide-react';

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

  const doubtStats = {
    resolved: 12,
    streak: 3,
    subjects: 4
  };

  return (
    <div className="max-w-[1400px] mx-auto w-full px-6 py-10 flex flex-col gap-12">
      {/* Top Section: Quick Actions & Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: 4 Cards (Takes up 2/3 space) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <h2 className="text-xl font-bold text-on-surface">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 flex-1">
            {/* Card 1: AI Mock Interview */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface-container-lowest to-surface p-6 border border-outline-variant/50 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none"></div>
              <div className="relative z-10">
                <h2 className="text-xl font-bold text-on-surface mb-2 tracking-tight">AI Mock Interviews</h2>
                <p className="text-xs text-on-surface-variant font-medium leading-relaxed mb-4">
                  Practice with a dynamic AI persona tailored to your resume and target role.
                </p>
              </div>
              <div className="relative z-10 flex items-center justify-between mt-auto">
                <Link to="/setup" className="btn-primary py-2 px-5 font-bold shadow-sm hover:-translate-y-0.5 transition-transform flex items-center gap-2 text-sm">
                  <Play size={14} className="fill-current" /> Start
                </Link>
                <Brain size={32} className="text-primary/20" />
              </div>
            </div>

            {/* Card 2: AI Doubt Solver */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="absolute -right-8 -bottom-8 opacity-10">
                <MessageSquare size={120} />
              </div>
              <div className="relative z-10">
                <div className="inline-flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide mb-2 backdrop-blur-sm">
                  <Sparkles size={10} /> New
                </div>
                <h2 className="text-xl font-bold mb-2">24/7 Doubt Solver</h2>
                <p className="text-blue-100 text-xs leading-relaxed mb-4">
                  Stuck? Our multi-modal AI tutor explains concepts step-by-step.
                </p>
              </div>
              <div className="relative z-10 flex items-center gap-2 mt-auto">
                <Link to="/doubts/new" className="bg-white text-blue-700 hover:bg-blue-50 py-2 px-4 rounded-xl font-bold shadow-sm transition-transform hover:-translate-y-0.5 flex items-center gap-1.5 text-xs">
                  <MessageSquare size={14} /> Ask
                </Link>
                <button className="bg-white/10 hover:bg-white/20 text-white py-2 px-3 rounded-xl backdrop-blur-sm transition-colors text-xs font-medium flex items-center gap-1.5">
                  <Camera size={14} /> Scan
                </button>
              </div>
            </div>

            {/* Card 3: Custom Scenarios */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="absolute -right-5 -bottom-5 opacity-10">
                <Target size={120} />
              </div>
              <div className="relative z-10">
                <h2 className="text-xl font-bold mb-2">Tailored Scenarios</h2>
                <p className="text-emerald-100 text-xs leading-relaxed mb-4">
                  Customize difficulty levels from Beginner to Expert to match your target role perfectly.
                </p>
              </div>
              <div className="relative z-10 flex items-center justify-between mt-auto">
                <Link to="/setup" className="bg-white text-emerald-700 hover:bg-emerald-50 py-2 px-5 rounded-xl font-bold shadow-sm transition-transform hover:-translate-y-0.5 flex items-center gap-2 text-sm">
                  <Code size={14} /> Configure
                </Link>
              </div>
            </div>

            {/* Card 4: Performance Tracking */}
            <div className="relative overflow-hidden rounded-2xl bg-surface-container p-6 border border-outline-variant/30 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="absolute right-0 top-0 w-24 h-24 bg-primary/5 rounded-full blur-xl"></div>
              <div className="relative z-10">
                <h2 className="text-xl font-bold text-on-surface mb-2">Performance Tracking</h2>
                <p className="text-xs text-on-surface-variant font-medium leading-relaxed mb-4">
                  Review your past interview reports and track your technical progress.
                </p>
              </div>
              <div className="relative z-10 flex items-center justify-between mt-auto">
                <Link to="/history" className="btn-secondary py-2 px-5 font-bold shadow-sm hover:-translate-y-0.5 transition-transform flex items-center gap-2 text-sm bg-white">
                  <HistoryIcon size={14} /> History
                </Link>
                <LineChart size={32} className="text-on-surface-variant/20" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Stats (Takes up 1/3 space) */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <h2 className="text-xl font-bold text-on-surface">Overview Stats</h2>
          <div className="flex flex-col gap-4 flex-1">
            {/* Interview Stats Group */}
            <div className="glass-card p-6 border border-outline-variant/30 flex flex-col justify-center gap-5 shadow-sm flex-1">
              <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
                <Brain size={16} className="text-primary"/> Mock Interviews
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center justify-center py-5 px-3 rounded-xl bg-primary/5">
                  <Target size={18} className="text-primary mb-1"/>
                  <span className="text-xl font-black text-on-surface">{interviews.length}</span>
                  <span className="text-[9px] text-on-surface-variant font-bold uppercase mt-1">Total</span>
                </div>
                <div className="flex flex-col items-center justify-center py-5 px-3 rounded-xl bg-[#00855b]/5">
                  <Zap size={18} className="text-[#00855b] mb-1"/>
                  <span className="text-xl font-black text-on-surface">{completedInterviews.length}</span>
                  <span className="text-[9px] text-on-surface-variant font-bold uppercase mt-1">Done</span>
                </div>
                <div className="flex flex-col items-center justify-center py-5 px-3 rounded-xl bg-[#5b21b6]/5">
                  <Activity size={18} className="text-[#5b21b6] mb-1"/>
                  <span className="text-xl font-black text-on-surface">{avgScore}%</span>
                  <span className="text-[9px] text-on-surface-variant font-bold uppercase mt-1">Avg Score</span>
                </div>
              </div>
            </div>

            {/* Doubt Solver Stats Group */}
            <div className="glass-card p-6 border border-outline-variant/30 flex flex-col justify-center gap-5 shadow-sm flex-1">
              <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
                <MessageSquare size={16} className="text-blue-600"/> Doubt Solver
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center justify-center py-5 px-3 rounded-xl bg-blue-50/50">
                  <Target size={18} className="text-blue-600 mb-1"/>
                  <span className="text-xl font-black text-on-surface">{doubtStats.resolved}</span>
                  <span className="text-[9px] text-on-surface-variant font-bold uppercase mt-1">Resolved</span>
                </div>
                <div className="flex flex-col items-center justify-center py-5 px-3 rounded-xl bg-amber-50/50">
                  <Zap size={18} className="text-amber-500 mb-1"/>
                  <span className="text-xl font-black text-on-surface">{doubtStats.streak}</span>
                  <span className="text-[9px] text-on-surface-variant font-bold uppercase mt-1">Day Streak</span>
                </div>
                <div className="flex flex-col items-center justify-center py-5 px-3 rounded-xl bg-purple-50/50">
                  <Brain size={18} className="text-purple-600 mb-1"/>
                  <span className="text-xl font-black text-on-surface">{doubtStats.subjects}</span>
                  <span className="text-[9px] text-on-surface-variant font-bold uppercase mt-1">Subjects</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-10">
        {/* Top Feature Row + Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            {/* How It Works Section */}
            <div className="glass-card p-8 border border-outline-variant/30 h-full">
              <h2 className="text-2xl font-bold text-on-surface mb-8 flex items-center gap-3">
                <Sparkles size={24} className="text-primary" /> How Mock Interviews Work
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
          </div>

          <div className="lg:col-span-1">
            {/* Recent Activity */}
            <div className="glass-card p-6 border border-outline-variant/30 h-full flex flex-col gap-6">
              {/* Interviews Activity */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                    <Brain size={18} className="text-primary"/> Recent Interviews
                  </h2>
                  <Link to="/history" className="text-xs font-bold text-primary hover:underline">View All</Link>
                </div>
                
                <div className="flex flex-col gap-2">
                  {loading ? (
                    <div className="text-on-surface-variant text-xs text-center py-4">Loading...</div>
                  ) : interviews.length === 0 ? (
                    <div className="text-on-surface-variant text-xs text-center py-4 bg-surface-container-lowest rounded-xl">No interviews yet</div>
                  ) : (
                    interviews.slice(0, 3).map(interview => (
                      <div key={interview._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-container-lowest transition-colors group cursor-pointer border border-transparent hover:border-outline-variant/20">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${interview.status === 'completed' ? 'bg-[#00855b]' : 'bg-[#b45309]'}`}></div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-on-surface text-sm truncate capitalize">{interview.role}</p>
                          <p className="text-[10px] text-on-surface-variant">
                            {new Date(interview.createdAt).toLocaleDateString()} • {interview.difficulty}
                          </p>
                        </div>
                        <Link to={interview.status === 'completed' ? `/feedback/${interview._id}` : `/interview/${interview._id}`} className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play size={14} className="text-primary" />
                        </Link>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="w-full h-px bg-outline-variant/30"></div>

              {/* Doubts Activity */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                    <MessageSquare size={18} className="text-blue-600"/> Recent Doubts
                  </h2>
                  <Link to="/doubts" className="text-xs font-bold text-blue-600 hover:underline">View All</Link>
                </div>
                
                <div className="flex flex-col gap-2">
                  {[
                    { id: 1, topic: "Time Complexity of QuickSort", subject: "Data Structures", date: "Today" },
                    { id: 2, topic: "React useEffect dependencies", subject: "Frontend", date: "Yesterday" },
                  ].map(doubt => (
                    <div key={doubt.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50/50 transition-colors group cursor-pointer border border-transparent hover:border-blue-100/50">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                        <MessageSquare size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-on-surface text-sm truncate">{doubt.topic}</p>
                        <p className="text-[10px] text-on-surface-variant">
                          {doubt.subject} • {doubt.date}
                        </p>
                      </div>
                      <Link to={`/doubts/${doubt.id}`} className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play size={14} className="text-blue-600" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Second Row: Remaining Information Blocks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            {/* How Doubt Solver Works Section */}
            <div className="glass-card p-8 border border-outline-variant/30 h-full">
              <h2 className="text-2xl font-bold text-on-surface mb-8 flex items-center gap-3">
                <MessageSquare size={24} className="text-blue-600" /> How AI Doubt Solver Works
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-black shrink-0 border-2 border-blue-200">1</div>
                  <div>
                    <h3 className="font-bold text-lg text-on-surface flex items-center gap-2 mb-2"><MessageSquare size={18} className="text-blue-600"/> Ask Anything</h3>
                    <p className="text-on-surface-variant text-sm leading-relaxed">Type your math equation, coding bug, or theoretical question into the chat. Our Llama-3 backend instantly comprehends the context of your query.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-black shrink-0 border-2 border-blue-200">2</div>
                  <div>
                    <h3 className="font-bold text-lg text-on-surface flex items-center gap-2 mb-2"><Camera size={18} className="text-blue-600"/> Multi-Modal Vision</h3>
                    <p className="text-on-surface-variant text-sm leading-relaxed">Stuck on a diagram? Upload an image or snap a photo of your textbook. Our advanced vision models will read and analyze the visual data seamlessly.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-black shrink-0 border-2 border-blue-200">3</div>
                  <div>
                    <h3 className="font-bold text-lg text-on-surface flex items-center gap-2 mb-2"><Mic size={18} className="text-blue-600"/> Voice Interactions</h3>
                    <p className="text-on-surface-variant text-sm leading-relaxed">Don't feel like typing? Use our integrated voice recorder. We transcribe your speech with high accuracy so you can converse naturally with your tutor.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-black shrink-0 border-2 border-blue-200">4</div>
                  <div>
                    <h3 className="font-bold text-lg text-on-surface flex items-center gap-2 mb-2"><Brain size={18} className="text-blue-600"/> Socratic Guidance</h3>
                    <p className="text-on-surface-variant text-sm leading-relaxed">Instead of just giving the answer, the AI breaks down the problem, explains the underlying concepts, and helps you arrive at the solution yourself.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            {/* Platform Features Section */}
            <div className="glass-card p-8 border border-outline-variant/30 h-full flex flex-col justify-center">
              <h2 className="text-xl font-bold text-on-surface mb-6">Under the Hood</h2>
              <div className="flex flex-col gap-4">
                <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/20">
                  <div className="flex items-center gap-3 mb-2">
                    <Code size={18} className="text-primary" />
                    <h4 className="font-bold text-on-surface text-sm">Powered by Groq</h4>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">Ultra-fast Llama 3 models via Groq API for near-instant responses.</p>
                </div>
                <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/20">
                  <div className="flex items-center gap-3 mb-2">
                    <Mic size={18} className="text-[#00855b]" />
                    <h4 className="font-bold text-on-surface text-sm">Web Speech API</h4>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">Native browser integration for seamless plugin-free voice interactions.</p>
                </div>
                <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/20">
                  <div className="flex items-center gap-3 mb-2">
                    <ShieldCheck size={18} className="text-[#b45309]" />
                    <h4 className="font-bold text-on-surface text-sm">Secure & Private</h4>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">Your resume and doubt queries are processed securely and never stored.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
