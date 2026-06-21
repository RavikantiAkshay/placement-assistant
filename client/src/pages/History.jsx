import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllInterviews } from '../services/interview.service';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';

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

  if (loading) {
    return <div className="p-12 text-center text-gray-500">Loading history...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto w-full px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview History</h1>
        <p className="text-gray-600">Review your past mock interviews and feedback.</p>
      </div>

      {interviews.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-gray-200 text-center shadow-sm">
          <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No history found</h2>
          <p className="text-gray-500 mb-6">You haven't completed any interviews yet.</p>
          <Link to="/setup" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors">
            Start an Interview
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {interviews.map(interview => (
            <div key={interview._id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${interview.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                  {interview.status === 'completed' ? <CheckCircle size={24} /> : <Clock size={24} />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 capitalize mb-1">{interview.role} Role</h3>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    <span>{new Date(interview.createdAt).toLocaleDateString()}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span className="capitalize">{interview.difficulty} Difficulty</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span>{interview.totalQuestions} Questions</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                {interview.status === 'completed' && interview.overallScore !== undefined && (
                  <div className="text-right">
                    <p className="text-sm text-gray-500 font-medium">Score</p>
                    <p className={`text-xl font-bold ${interview.overallScore >= 70 ? 'text-green-600' : 'text-yellow-600'}`}>
                      {interview.overallScore}/100
                    </p>
                  </div>
                )}
                
                {interview.status === 'completed' ? (
                  <Link 
                    to={`/feedback/${interview._id}`}
                    className="px-5 py-2.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 font-medium text-sm transition-colors whitespace-nowrap"
                  >
                    View Report
                  </Link>
                ) : (
                  <Link 
                    to={`/interview/${interview._id}`}
                    className="px-5 py-2.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 font-medium text-sm transition-colors whitespace-nowrap"
                  >
                    Resume Session
                  </Link>
                )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
