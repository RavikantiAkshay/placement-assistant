import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllInterviews, deleteInterview } from '../services/interview.service';
import { Clock, CheckCircle, AlertCircle, Loader2, ArrowRight, Trash2 } from 'lucide-react';

const History = () => {
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
    if (window.confirm('Are you sure you want to delete this interview? This cannot be undone.')) {
      try {
        await deleteInterview(id);
        setInterviews(interviews.filter(i => i._id !== id));
      } catch (error) {
        console.error('Failed to delete interview', error);
        alert('Failed to delete interview');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-73px)] items-center justify-center flex-col gap-4">
        <Loader2 size={40} className="animate-spin text-primary" />
        <p className="text-on-surface-variant font-medium">Loading history...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto w-full px-6 py-12">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-3xl font-bold text-on-surface mb-3 tracking-tight">Interview History</h1>
        <p className="text-on-surface-variant text-lg">Review your past mock interviews and track your improvement over time.</p>
      </div>

      {interviews.length === 0 ? (
        <div className="glass-card p-16 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="w-24 h-24 mx-auto bg-surface-container rounded-full flex items-center justify-center text-outline mb-6">
            <AlertCircle size={48} />
          </div>
          <h2 className="text-2xl font-bold text-on-surface mb-3">No history found</h2>
          <p className="text-on-surface-variant mb-8 max-w-md mx-auto">You haven't completed any interviews yet. Start a new session to begin tracking your progress.</p>
          <Link to="/setup" className="btn-primary w-fit mx-auto">
            Start an Interview <ArrowRight size={18} />
          </Link>
        </div>
      ) : (
        <div className="grid gap-5">
          {interviews.map(interview => (
            <div key={interview._id} className="glass-card p-6 px-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
              
              <div className="flex items-start gap-5">
                <div className={`p-4 rounded-2xl shrink-0 ${interview.status === 'completed' ? 'bg-[#00855b]/10 text-[#00855b]' : 'bg-[#b45309]/10 text-[#b45309]'}`}>
                  {interview.status === 'completed' ? <CheckCircle size={28} /> : <Clock size={28} />}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-on-surface capitalize mb-1.5">{interview.role}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-on-surface-variant">
                    <span>{new Date(interview.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    <span className="w-1.5 h-1.5 bg-outline-variant rounded-full"></span>
                    <span className="capitalize">{interview.difficulty} Level</span>
                    <span className="w-1.5 h-1.5 bg-outline-variant rounded-full"></span>
                    <span>{interview.totalQuestions} Questions</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6 mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-none border-outline-variant/30 w-full md:w-auto">
                {interview.status === 'completed' && interview.overallScore !== undefined && (
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wider text-on-surface-variant font-bold mb-0.5">Score</p>
                    <p className={`text-2xl font-black ${interview.overallScore >= 70 ? 'text-[#00855b]' : 'text-[#b45309]'}`}>
                      {interview.overallScore}<span className="text-sm font-medium text-outline-variant">/100</span>
                    </p>
                  </div>
                )}
                
                <div className="flex items-center gap-3">
                  {interview.status === 'completed' ? (
                    <Link 
                      to={`/feedback/${interview._id}`}
                      className="btn-secondary whitespace-nowrap"
                    >
                      View Report
                    </Link>
                  ) : (
                    <Link 
                      to={`/interview/${interview._id}`}
                      className="btn-primary whitespace-nowrap"
                    >
                      Resume Session
                    </Link>
                  )}
                  <button 
                    onClick={() => handleDelete(interview._id)}
                    className="p-3 text-outline-variant hover:text-error hover:bg-error/10 rounded-xl transition-colors"
                    title="Delete Interview"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
