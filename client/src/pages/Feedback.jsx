import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getFeedback } from '../services/interview.service';
import { Loader2, ArrowLeft, CheckCircle2, AlertTriangle, TrendingUp, BrainCircuit } from 'lucide-react';

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
      <div className="flex h-[calc(100vh-73px)] items-center justify-center flex-col gap-5">
        <div className="w-16 h-16 bg-primary-container/20 rounded-2xl flex items-center justify-center text-primary animate-pulse">
          <BrainCircuit size={32} />
        </div>
        <p className="text-on-surface-variant font-medium text-lg">Analyzing interview performance...</p>
      </div>
    );
  }

  if (error || !feedbackData || !feedbackData.feedback) {
    return (
      <div className="p-16 text-center text-error font-medium glass-card mt-12 mx-auto max-w-lg">
        <AlertTriangle size={40} className="mx-auto mb-4 opacity-80" />
        {error || 'Feedback report not available.'}
      </div>
    );
  }

  const { overallScore, strengths, areasForImprovement, detailedFeedback } = feedbackData.feedback;

  return (
    <div className="max-w-4xl mx-auto w-full px-6 py-12">
      <Link to="/history" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary mb-8 font-medium transition-colors">
        <ArrowLeft size={18} /> Back to History
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-8 border-b border-outline-variant/30">
        <div>
          <h1 className="text-4xl font-black text-on-surface mb-3 tracking-tight">Performance Report</h1>
          <p className="text-on-surface-variant text-lg font-medium capitalize flex items-center gap-2">
            {feedbackData.role} <span className="w-1.5 h-1.5 bg-outline-variant rounded-full"></span> {feedbackData.difficulty} Level
          </p>
        </div>
        <div className="glass-panel px-8 py-5 text-center border-t-4 border-t-primary shadow-lg shadow-primary/5">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Overall Score</p>
          <div className="flex items-baseline justify-center gap-1">
            <span className={`text-5xl font-black ${overallScore >= 80 ? 'text-[#00855b]' : overallScore >= 60 ? 'text-[#b45309]' : 'text-error'}`}>
              {overallScore}
            </span>
            <span className="text-on-surface-variant font-bold text-xl">/100</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <div className="glass-card p-8 border-t-4 border-t-[#00855b]">
          <h3 className="text-xl font-bold text-on-surface flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#00855b]/10 rounded-lg text-[#00855b]">
              <CheckCircle2 size={24} />
            </div>
            Key Strengths
          </h3>
          <ul className="space-y-4">
            {strengths?.map((str, idx) => (
              <li key={idx} className="flex items-start gap-3 text-on-surface">
                <span className="w-2 h-2 rounded-full bg-[#00855b] mt-2 shrink-0 shadow-[0_0_8px_rgba(0,133,91,0.5)]"></span>
                <span className="leading-relaxed">{str}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-card p-8 border-t-4 border-t-[#b45309]">
          <h3 className="text-xl font-bold text-on-surface flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#b45309]/10 rounded-lg text-[#b45309]">
              <AlertTriangle size={24} />
            </div>
            Areas to Improve
          </h3>
          <ul className="space-y-4">
            {areasForImprovement?.map((area, idx) => (
              <li key={idx} className="flex items-start gap-3 text-on-surface">
                <span className="w-2 h-2 rounded-full bg-[#b45309] mt-2 shrink-0 shadow-[0_0_8px_rgba(180,83,9,0.5)]"></span>
                <span className="leading-relaxed">{area}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-on-surface mb-8 flex items-center gap-3">
        <div className="p-2.5 bg-primary-container/20 rounded-xl text-primary">
          <TrendingUp size={24} /> 
        </div>
        Detailed Q&A Analysis
      </h2>
      
      <div className="space-y-6">
        {detailedFeedback?.map((item, idx) => (
          <div key={idx} className="glass-card p-8 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
            <div className="flex justify-between items-start gap-6 mb-6">
              <h4 className="text-lg font-bold text-on-surface leading-relaxed">
                <span className="text-primary mr-3 text-xl bg-primary/10 px-3 py-1 rounded-lg">Q{idx + 1}</span> 
                {item.question}
              </h4>
              <span className="shrink-0 flex items-center justify-center px-4 py-1.5 rounded-full bg-surface-container-high border border-outline-variant/30 text-on-surface text-sm font-bold shadow-sm">
                Score: <span className={`ml-1 ${item.score >= 8 ? 'text-[#00855b]' : item.score >= 5 ? 'text-[#b45309]' : 'text-error'}`}>{item.score}/10</span>
              </span>
            </div>
            
            <div className="bg-surface-container/50 p-5 rounded-xl border border-outline-variant/30 mb-5 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-outline-variant"></div>
              <p className="text-xs uppercase tracking-wider text-on-surface-variant font-bold mb-2">Your Answer</p>
              <p className="text-on-surface italic leading-relaxed">"{item.candidateAnswer}"</p>
            </div>
            
            <div className="bg-primary/5 p-5 rounded-xl border border-primary/20 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
              <p className="text-xs uppercase tracking-wider text-primary font-bold mb-2">AI Feedback</p>
              <p className="text-on-surface leading-relaxed">{item.feedback}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Feedback;
