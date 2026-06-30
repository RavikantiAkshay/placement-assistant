import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllInterviews, deleteInterview } from '../services/interview.service';
import { useAuth } from '../context/AuthContext';
import { ChatContext } from '../context/ChatContext';
import { useContext } from 'react';
import { ActivityCalendar } from 'react-activity-calendar';
import { Play, Target, Zap, Activity, Brain, FileText, Mic, LineChart, Code, ShieldCheck, Sparkles, Trash2, Camera, MessageSquare, History as HistoryIcon, BarChart, CalendarDays, Check } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { chats } = useContext(ChatContext);
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

  // Calculate unique subjects
  const uniqueSubjects = new Set(chats?.map(c => c.subject).filter(Boolean)).size;

  // Calculate day streak
  let currentStreak = 0;
  if (chats && chats.length > 0) {
    const sortedDates = [...new Set(chats.map(c => {
      const d = c.updatedAt || c.createdAt || new Date();
      return new Date(new Date(d).setHours(0,0,0,0)).getTime();
    }))].sort((a, b) => b - a);
    
    let today = new Date().setHours(0,0,0,0);
    let yesterday = today - 86400000;

    if (sortedDates[0] === today || sortedDates[0] === yesterday) {
      let currentDate = sortedDates[0];
      for (let i = 0; i < sortedDates.length; i++) {
        if (sortedDates[i] === currentDate) {
          currentStreak++;
          currentDate -= 86400000;
        } else {
          break;
        }
      }
    }
  }

  const doubtStats = {
    total: chats?.length || 0,
    streak: currentStreak,
    subjects: uniqueSubjects
  };

  // Weak Topics Calculation
  const weakTopicsCount = {};
  completedInterviews.forEach(interview => {
    if (interview.weakAreas && Array.isArray(interview.weakAreas)) {
      interview.weakAreas.forEach(topic => {
        const t = topic.toLowerCase().trim();
        weakTopicsCount[t] = (weakTopicsCount[t] || 0) + 1;
      });
    }
  });
  const topWeakTopics = Object.entries(weakTopicsCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([topic]) => topic);

  // Global Stats
  // 10 Distinct Global Stats
  const totalQuestionsAnswered = completedInterviews.reduce((acc, curr) => acc + (curr.questions?.length || 0), 0);
  const estimatedHours = ((totalQuestionsAnswered * 3) / 60).toFixed(1);
  const uniqueWeaknesses = new Set();
  completedInterviews.forEach(i => i.weakAreas?.forEach(w => uniqueWeaknesses.add(w.toLowerCase().trim())));
  const passedMocks = completedInterviews.filter(i => (i.overallScore || 0) >= 75).length;
  const clearRate = completedInterviews.length > 0 ? Math.round((passedMocks / completedInterviews.length) * 100) : 0;
  const uniqueRoles = new Set(interviews.map(i => i.role?.split(' ')[0].toLowerCase().trim()).filter(Boolean));
  const techSkills = new Set();
  completedInterviews.forEach(i => i.technicalKeywords?.found?.forEach(k => techSkills.add(k.toLowerCase().trim())));
  const softSkills = new Set();
  completedInterviews.forEach(i => i.softKeywords?.found?.forEach(k => softSkills.add(k.toLowerCase().trim())));
  const exploredTopics = new Set();
  interviews.forEach(i => i.tags?.forEach(t => exploredTopics.add(t.toLowerCase().trim())));
  const avgQs = completedInterviews.length > 0 ? Math.round(totalQuestionsAnswered / completedInterviews.length) : 0;

  // Resume Skill Coverage (From latest interview)
  const latestInterview = completedInterviews[0];
  const foundSkills = latestInterview?.technicalKeywords?.found || ['React', 'JavaScript', 'Node.js', 'Express', 'MongoDB'];
  const missingSkills = latestInterview?.technicalKeywords?.missing || ['AWS', 'Docker', 'GraphQL', 'Redis', 'CI/CD'];
  const totalSkills = foundSkills.length + missingSkills.length;
  const matchScore = totalSkills > 0 ? Math.round((foundSkills.length / totalSkills) * 100) : 0;

  // Practice Queue State
  const [practiceQueue, setPracticeQueue] = useState([
    { id: 1, text: 'System Design', completed: false },
    { id: 2, text: 'React Performance', completed: false },
    { id: 3, text: 'CI/CD Pipelines', completed: false }
  ]);
  const [newTopic, setNewTopic] = useState('');

  const handleAddTopic = (e) => {
    if (e.key === 'Enter' && newTopic.trim() !== '') {
      setPracticeQueue([...practiceQueue, { id: Date.now(), text: newTopic.trim(), completed: false }]);
      setNewTopic('');
    }
  };

  const toggleTopic = (id) => {
    setPracticeQueue(practiceQueue.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  // Topic Mastery Map
  const topicMastery = {};
  completedInterviews.forEach(i => {
    if (i.role) {
      const r = i.role.split(' ')[0].toLowerCase();
      topicMastery[r] = (topicMastery[r] || 0) + 1;
    }
  });
  if (chats) {
    chats.forEach(c => {
      if (c.subject && c.subject.trim() !== '') {
        const s = c.subject.toLowerCase();
        topicMastery[s] = (topicMastery[s] || 0) + 1;
      }
    });
  }
  const topMastery = Object.entries(topicMastery)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const globalStatsList = [
    { label: 'Questions', value: totalQuestionsAnswered, color: 'text-blue-700', bg: 'bg-blue-50/50', border: 'border-blue-100' },
    { label: 'Hours', value: estimatedHours + 'h', color: 'text-emerald-700', bg: 'bg-emerald-50/50', border: 'border-emerald-100' },
    { label: 'Weaknesses', value: uniqueWeaknesses.size, color: 'text-rose-700', bg: 'bg-rose-50/50', border: 'border-rose-100' },
    { label: 'Passed', value: passedMocks, color: 'text-green-700', bg: 'bg-green-50/50', border: 'border-green-100' },
    { label: 'Clear Rate', value: clearRate + '%', color: 'text-teal-700', bg: 'bg-teal-50/50', border: 'border-teal-100' },
    { label: 'Roles', value: uniqueRoles.size, color: 'text-amber-700', bg: 'bg-amber-50/50', border: 'border-amber-100' },
    { label: 'Tech Skills', value: techSkills.size, color: 'text-indigo-700', bg: 'bg-indigo-50/50', border: 'border-indigo-100' },
    { label: 'Soft Skills', value: softSkills.size, color: 'text-purple-700', bg: 'bg-purple-50/50', border: 'border-purple-100' },
    { label: 'Topics', value: exploredTopics.size, color: 'text-orange-700', bg: 'bg-orange-50/50', border: 'border-orange-100' },
    { label: 'Avg Qs/Mock', value: avgQs, color: 'text-cyan-700', bg: 'bg-cyan-50/50', border: 'border-cyan-100' }
  ];

  // Heatmap Data
  const activityMap = {};
  interviews.forEach(i => {
    if (!i.createdAt) return;
    try {
      const dateStr = new Date(i.createdAt).toISOString().split('T')[0];
      activityMap[dateStr] = (activityMap[dateStr] || 0) + 1;
    } catch(e){}
  });
  if (chats) {
    chats.forEach(c => {
      const dateVal = c.updatedAt || c.createdAt;
      if (!dateVal) return;
      try {
        const dateStr = new Date(dateVal).toISOString().split('T')[0];
        activityMap[dateStr] = (activityMap[dateStr] || 0) + 1;
      } catch(e){}
    });
  }
  
  const activityData = [];
  const todayDate = new Date();
  for (let i = 180; i >= 0; i--) {
    const d = new Date();
    d.setDate(todayDate.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const count = activityMap[dateStr] || 0;
    activityData.push({
      date: dateStr,
      count: count,
      level: count === 0 ? 0 : count > 4 ? 4 : count
    });
  }

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
                  <span className="text-xl font-black text-on-surface">{doubtStats.total}</span>
                  <span className="text-[9px] text-on-surface-variant font-bold uppercase mt-1">Total Asked</span>
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

        {/* Row 1: Heatmap & Global Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Activity Calendar */}
            <div className="glass-card p-8 border border-outline-variant/30 h-full overflow-hidden relative group shadow-sm flex flex-col justify-center">
              <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 group-hover:bg-primary/10 transition-colors"></div>
              <h2 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
                <CalendarDays size={20} className="text-primary"/> Activity Calendar
              </h2>
              <div className="w-full pb-2 flex justify-center items-center">
                <div className="w-full flex justify-center items-center px-4">
                  <ActivityCalendar 
                    data={activityData} 
                    theme={{
                      light: ['#f1f5f9', '#bae6fd', '#7dd3fc', '#38bdf8', '#0284c7'],
                      dark: ['#1e293b', '#0c4a6e', '#0369a1', '#0284c7', '#38bdf8']
                    }}
                    colorScheme="light"
                    labels={{
                      legend: { less: 'Less', more: 'More' },
                      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                      totalCount: '{{count}} interactions in the last 6 months'
                    }}
                    hideColorLegend={false}
                    hideMonthLabels={false}
                    blockSize={15}
                    blockRadius={4}
                    blockMargin={5}
                    fontSize={13}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            {/* Global Stats */}
            <div className="glass-card p-6 border border-outline-variant/30 flex flex-col gap-4 h-full justify-center shadow-sm">
              <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <BarChart size={18} className="text-blue-500"/> Global Stats
              </h2>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {globalStatsList.map((stat, i) => (
                  <div key={i} className={`${stat.bg} p-1.5 rounded-lg border ${stat.border} flex flex-col items-center justify-center`}>
                    <span className={`text-base font-black ${stat.color} leading-none`}>{stat.value}</span>
                    <span className={`text-[8px] ${stat.color} font-bold uppercase mt-1 text-center opacity-80 tracking-wider`}>{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Goals, Needs Attention, Topic Mastery */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
              {/* Goal Progress */}
              <div className="glass-card p-6 border border-outline-variant/30 flex flex-col gap-4 h-full justify-center shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Target size={64} className="text-primary"/>
                </div>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                    <Target size={18} className="text-primary"/> Career Goal
                  </h2>
                </div>
                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-1">Target Role</p>
                      <p className="font-bold text-on-surface capitalize truncate max-w-[150px]">{user?.goals?.targetRole || 'Software Engineer'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-1">Target Score</p>
                      <p className="font-bold text-primary text-xl leading-none">{user?.goals?.targetScore || 80}%</p>
                    </div>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-2.5 mt-3">
                    <div className="bg-gradient-to-r from-primary to-blue-500 h-2.5 rounded-full" style={{ width: `${Math.min((avgScore / (user?.goals?.targetScore || 80)) * 100, 100)}%` }}></div>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-[10px] text-on-surface-variant font-medium">Current Avg: {avgScore}%</p>
                    <p className="text-[10px] font-bold text-primary">{Math.round(Math.min((avgScore / (user?.goals?.targetScore || 80)) * 100, 100))}% Achieved</p>
                  </div>
                </div>
              </div>
          </div>

          <div className="lg:col-span-1">
              {/* Weak Topics */}
              <div className="glass-card p-6 border border-outline-variant/30 flex flex-col gap-4 h-full justify-center shadow-sm">
                <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                  <Brain size={18} className="text-orange-500"/> Needs Attention
                </h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  {topWeakTopics.length > 0 ? topWeakTopics.map((topic, i) => (
                    <span key={i} className="px-3 py-1.5 bg-orange-50 text-orange-700 border border-orange-100 rounded-lg text-xs font-bold capitalize">
                      {topic}
                    </span>
                  )) : <p className="text-xs text-on-surface-variant">Complete more interviews to identify weaknesses.</p>}
                </div>
              </div>
          </div>

          <div className="lg:col-span-1">
            {/* Topic Mastery Map */}
            <div className="glass-card p-6 border border-outline-variant/30 h-full shadow-sm flex flex-col">
              <h2 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
                <Brain size={18} className="text-primary"/> Topic Mastery
              </h2>
              <div className="flex flex-col gap-3 flex-1 justify-center">
                {topMastery.length > 0 ? topMastery.map(([topic, count], i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-container-lowest transition-colors border border-transparent hover:border-outline-variant/20">
                    <span className="font-bold text-sm text-on-surface capitalize truncate">{topic}</span>
                    <span className="text-xs text-on-surface-variant font-medium bg-surface-container px-2 py-1 rounded-md">{count} sessions</span>
                  </div>
                )) : (
                  <div className="text-center py-6 text-xs text-on-surface-variant">
                    No topics mapped yet.<br/>Start practicing!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* New Skills & Queue Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Resume Skill Coverage */}
            <div className="glass-card p-8 border border-outline-variant/30 h-full shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
                  <FileText size={20} className="text-primary"/> Resume Skill Coverage
                </h2>
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">Target Role: {user?.goals?.targetRole || 'Software Engineer'}</span>
              </div>
              <div className="flex-1 flex flex-col md:flex-row gap-8 mt-2">
                <div className="flex flex-col justify-center items-center md:w-1/4 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6">
                  <div className="relative w-28 h-28 flex items-center justify-center mb-4">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-surface-container-high"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-primary"
                        strokeDasharray={`${matchScore}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-2xl font-black text-on-surface">{matchScore}%</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest text-center">Match Rate</span>
                </div>

                <div className="md:w-3/4 flex flex-col justify-center gap-6">
                  <div>
                    <span className="text-xs font-bold text-[#00855b] uppercase tracking-wider mb-3 block flex items-center gap-2">
                      <ShieldCheck size={14}/> Validated Skills
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {foundSkills.length > 0 ? foundSkills.slice(0, 15).map((s, i) => (
                        <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00855b]/10 border border-[#00855b]/20 text-[#00855b] transition-colors hover:bg-[#00855b]/20">
                          <span className="font-bold text-xs">{s}</span>
                        </div>
                      )) : <span className="text-xs text-on-surface-variant">No skills validated yet.</span>}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3 block flex items-center gap-2">
                      <div className="w-3 h-3 flex items-center justify-center font-bold text-[10px] text-on-surface-variant">✕</div> Missing Requirements
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {missingSkills.length > 0 ? missingSkills.slice(0, 15).map((s, i) => (
                        <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container border border-outline-variant/50 text-on-surface-variant transition-colors hover:bg-surface-container-high">
                          <span className="font-bold text-xs">{s}</span>
                        </div>
                      )) : <span className="text-xs text-on-surface-variant">No missing requirements.</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            {/* Practice Queue */}
            <div className="glass-card p-6 border border-outline-variant/30 h-full shadow-sm flex flex-col">
              <h2 className="text-lg font-bold text-on-surface flex items-center gap-2 mb-4">
                <Target size={18} className="text-blue-500"/> Practice Queue
              </h2>
              <div className="flex flex-col gap-2 flex-1">
                {practiceQueue.map((topic) => (
                  <div key={topic.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-container border border-outline-variant/30 group">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => toggleTopic(topic.id)}>
                      <div className={`w-5 h-5 rounded-md border-2 transition-colors flex items-center justify-center ${topic.completed ? 'bg-primary border-primary' : 'border-outline-variant/50 group-hover:border-primary'}`}>
                        {topic.completed && <Check size={14} className="text-white" strokeWidth={3} />}
                      </div>
                      <span className={`font-bold text-sm text-on-surface ${topic.completed ? 'line-through opacity-50' : ''}`}>{topic.text}</span>
                    </div>
                  </div>
                ))}
                <div className="mt-auto pt-4">
                  <input 
                    type="text" 
                    placeholder="+ Add topic and press Enter..." 
                    className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:border-primary transition-colors text-on-surface"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    onKeyDown={handleAddTopic}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

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
                  <Link to="/doubts/new" className="text-xs font-bold text-blue-600 hover:underline">View All</Link>
                </div>
                
                <div className="flex flex-col gap-2">
                  {chats && chats.length > 0 ? (
                    chats.slice(0, 3).map(doubt => (
                      <div key={doubt._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50/50 transition-colors group cursor-pointer border border-transparent hover:border-blue-100/50">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                          <MessageSquare size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-on-surface text-sm truncate">{doubt.title}</p>
                          <p className="text-[10px] text-on-surface-variant">
                            {doubt.subject} • {new Date(doubt.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Link to={`/doubts/${doubt._id}`} className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center w-6 h-6 rounded-full bg-white shadow-sm border border-gray-100">
                          <Play size={10} className="text-blue-600 ml-0.5" />
                        </Link>
                      </div>
                    ))
                  ) : (
                    <div className="text-on-surface-variant text-xs text-center py-4 bg-surface-container-lowest rounded-xl">No doubts asked yet</div>
                  )}
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
