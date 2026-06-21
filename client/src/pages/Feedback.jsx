import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getFeedback } from '../services/interview.service';
import { Loader2, ArrowLeft, CheckCircle2, AlertTriangle, TrendingUp } from 'lucide-react';

const Feedback = () => {
  const { id } = useParams();
  const [feedbackData, setFeedbackData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const data = await getFeedback(id);
        setFeedbackData(data);
      } catch (err) {
        setError('Failed to load feedback report.');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-73px)] items-center justify-center flex-col gap-4">
        <Loader2 size={40} className="animate-spin text-indigo-600" />
        <p className="text-gray-500 font-medium">Analyzing your interview performance...</p>
      </div>
    );
  }

  if (error || !feedbackData || !feedbackData.feedback) {
    return (
      <div className="p-12 text-center text-red-500 font-medium">
        {error || 'Feedback report not available.'}
      </div>
    );
  }

  const { overallScore, strengths, areasForImprovement, detailedFeedback } = feedbackData.feedback;

  return (
    <div className="max-w-4xl mx-auto w-full px-6 py-12">
      <Link to="/history" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 font-medium transition-colors">
        <ArrowLeft size={18} /> Back to History
      </Link>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-8 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Performance Report</h1>
          <p className="text-gray-500 capitalize">{feedbackData.role} Role • {feedbackData.difficulty} Difficulty</p>
        </div>
        <div className="bg-white px-6 py-4 rounded-xl border border-gray-200 shadow-sm text-center">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Overall Score</p>
          <div className="flex items-baseline justify-center gap-1">
            <span className={`text-4xl font-extrabold ${overallScore >= 80 ? 'text-green-600' : overallScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
              {overallScore}
            </span>
            <span className="text-gray-400 font-medium">/100</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-green-50 p-6 rounded-xl border border-green-100">
          <h3 className="text-lg font-bold text-green-800 flex items-center gap-2 mb-4">
            <CheckCircle2 size={20} className="text-green-600" /> Key Strengths
          </h3>
          <ul className="space-y-3">
            {strengths?.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2 text-green-700">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0"></span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-orange-50 p-6 rounded-xl border border-orange-100">
          <h3 className="text-lg font-bold text-orange-800 flex items-center gap-2 mb-4">
            <AlertTriangle size={20} className="text-orange-600" /> Areas to Improve
          </h3>
          <ul className="space-y-3">
            {areasForImprovement?.map((area, idx) => (
              <li key={idx} className="flex items-start gap-2 text-orange-700">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 shrink-0"></span>
                <span>{area}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <TrendingUp size={24} className="text-indigo-600" /> Detailed Q&A Analysis
      </h2>
      
      <div className="space-y-6">
        {detailedFeedback?.map((item, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start gap-4 mb-4">
              <h4 className="text-base font-bold text-gray-900 leading-snug">
                <span className="text-indigo-600 mr-2">Q{idx + 1}.</span> 
                {item.question}
              </h4>
              <span className="shrink-0 inline-flex items-center justify-center px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-bold">
                {item.score}/10
              </span>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-4">
              <p className="text-sm text-gray-600 font-medium mb-1">Your Answer:</p>
              <p className="text-gray-800 italic text-sm">"{item.candidateAnswer}"</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">Feedback:</p>
              <p className="text-gray-800 text-sm">{item.feedback}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Feedback;
