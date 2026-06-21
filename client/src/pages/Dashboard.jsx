import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllInterviews } from '../services/interview.service';
import { useAuth } from '../context/AuthContext';
import { Play, Clock, Star, TrendingUp, AlertCircle } from 'lucide-react';

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

  const completedInterviews = interviews.filter(i => i.status === 'completed');
  const avgScore = completedInterviews.length > 0
    ? Math.round(completedInterviews.reduce((acc, curr) => acc + (curr.overallScore || 0), 0) / completedInterviews.length)
    : 0;

  return (
    <div className="max-w-6xl mx-auto w-full px-6 py-12 flex flex-col gap-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.name}!</h1>
          <p className="text-gray-600">Track your progress and ace your next technical interview.</p>
        </div>
        <Link 
          to="/setup" 
          className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap"
        >
          <Play size={18} /> New Interview
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Interviews</p>
            <p className="text-2xl font-bold text-gray-900">{interviews.length}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
            <Star size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Completed</p>
            <p className="text-2xl font-bold text-gray-900">{completedInterviews.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Average Score</p>
            <p className="text-2xl font-bold text-gray-900">{avgScore}%</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : interviews.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No interviews yet</h3>
            <p className="text-gray-500 mb-6">Start your first mock interview to get personalized feedback.</p>
            <Link to="/setup" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors">
              Start Now
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {interviews.slice(0, 5).map(interview => (
              <div key={interview._id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-base font-bold text-gray-900 capitalize">{interview.role} Interview</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                      interview.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {interview.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(interview.createdAt).toLocaleDateString()} • Difficulty: <span className="capitalize">{interview.difficulty}</span>
                  </p>
                </div>
                
                {interview.status === 'completed' ? (
                  <Link 
                    to={`/feedback/${interview._id}`}
                    className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 font-medium text-sm text-center transition-colors"
                  >
                    View Feedback
                  </Link>
                ) : (
                  <Link 
                    to={`/interview/${interview._id}`}
                    className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 font-medium text-sm text-center transition-colors"
                  >
                    Resume
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
