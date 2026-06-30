import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getFeedback } from '../services/interview.service';
import { 
  ArrowLeft, CheckCircle2, AlertTriangle, TrendingUp, BrainCircuit, 
  Activity, MessageSquare, BookOpen, UserCheck, Target, Zap, Clock, 
  Calendar, Briefcase, Award, AlertCircle
} from 'lucide-react';

const Feedback = () => {
  const { id } = useParams();
  const [feedbackData, setFeedbackData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleGenerateQuiz = (topic) => {
    const prompt = `I noticed I have a weakness in "${topic}". Can you provide a tailored reading list or a 5-question micro-quiz to help me immediately patch this knowledge gap?`;
    navigate('/doubts/new', { state: { initialPrompt: prompt, subject: 'Software Engineering' } });
  };

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
      <div className="max-w-[1400px] mx-auto w-full px-4 md:px-8 py-10 pb-24 animate-pulse">
        <div className="w-32 h-4 bg-surface-container rounded mb-8"></div>
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 mb-12 pb-10 border-b border-outline-variant/30">
          <div className="flex-1 space-y-4">
            <div className="w-48 h-6 bg-surface-container rounded-full"></div>
            <div className="w-64 h-12 bg-surface-container rounded-lg"></div>
            <div className="w-48 h-6 bg-surface-container rounded"></div>
          </div>
          <div className="flex gap-4">
            <div className="w-40 h-24 bg-surface-container rounded-xl"></div>
            <div className="w-40 h-24 bg-surface-container rounded-xl"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-surface-container rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !feedbackData || !feedbackData.feedback) {
    return (
      <div className="p-16 text-center text-error font-medium glass-card mt-12 mx-auto max-w-lg">
        <AlertTriangle size={40} className="mx-auto mb-4 opacity-80" />
        {error || 'Feedback report not available. It might still be processing.'}
      </div>
    );
  }

  const { 
    overallScore, hireabilityScore, interviewReadiness, predictedRoleFit,
    metrics, topicHeatmap, missingKeywords, sevenDayImprovementPlan,
    strengths, areasForImprovement, detailedFeedback 
  } = feedbackData.feedback;

  const renderProgressCircle = (score, label, icon) => {
    if (score === undefined) return null;
    const colorClass = score >= 80 ? 'text-[#00855b]' : score >= 60 ? 'text-[#b45309]' : 'text-error';
    return (
      <div className="glass-card p-6 flex flex-col items-center justify-center text-center relative overflow-hidden group">
        <div className={`absolute -right-4 -top-4 opacity-5 transition-transform group-hover:scale-150 duration-500`}>
          {icon}
        </div>
        <div className={`mb-3 ${colorClass}`}>{icon}</div>
        <div className="flex items-baseline justify-center gap-1 mb-1 relative z-10">
          <span className={`text-4xl font-black ${colorClass}`}>{score}</span>
          <span className="text-on-surface-variant font-bold text-lg">/100</span>
        </div>
        <span className="text-sm font-bold text-on-surface-variant uppercase tracking-wider relative z-10">{label}</span>
      </div>
    );
  };

  return (
    <div className="max-w-[1400px] mx-auto w-full px-4 md:px-8 py-10 pb-24">
      <Link to="/history" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary mb-8 font-medium transition-colors">
        <ArrowLeft size={18} /> Back to Dashboard
      </Link>

      {/* HEADER: Verdict & Overall Scores */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 mb-12 pb-10 border-b border-outline-variant/30">
        <div className="flex-1">
          <div className="inline-block px-3 py-1 bg-surface-container rounded-full text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">
            AI Interview Intelligence
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-on-surface mb-4 tracking-tight leading-tight">
            Performance Analytics
          </h1>
          <p className="text-on-surface-variant text-xl font-medium capitalize flex flex-wrap items-center gap-3">
            <span className="text-primary bg-primary/10 px-3 py-1 rounded-md">{feedbackData.role}</span>
            <span className="w-1.5 h-1.5 bg-outline-variant rounded-full"></span> 
            {feedbackData.difficulty} Level
          </p>
        </div>
        
        <div className="flex flex-wrap items-stretch gap-4 shrink-0">
          {interviewReadiness && (
            <div className="glass-panel px-6 py-5 flex items-center gap-4 border-l-4 border-l-[#00855b]">
              <div className="p-3 bg-[#00855b]/10 rounded-full text-[#00855b]"><Award size={28} /></div>
              <div>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Readiness Level</p>
                <p className="text-2xl font-black text-on-surface">{interviewReadiness}</p>
              </div>
            </div>
          )}
          
          {hireabilityScore && (
            <div className="glass-panel px-6 py-5 text-center border-t-4 border-t-primary shadow-lg">
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Hireability Score</p>
              <div className="flex items-baseline justify-center gap-1">
                <span className={`text-5xl font-black ${hireabilityScore >= 80 ? 'text-[#00855b]' : hireabilityScore >= 60 ? 'text-[#b45309]' : 'text-error'}`}>
                  {hireabilityScore}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DETAILED METRICS SECTION */}
      {metrics && (
        <div className="mb-12">
          <h2 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
            <Activity className="text-primary" /> Core Competencies
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Communication Panel */}
            <div className="glass-card p-6 border-t-4 border-t-[#8b5cf6]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg flex items-center gap-2"><MessageSquare size={20} className="text-[#8b5cf6]"/> Communication</h3>
                <span className="text-2xl font-black text-[#8b5cf6]">{metrics.communication?.score}/100</span>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-on-surface-variant">Speaking Pace</span>
                  <span className="font-mono font-bold text-on-surface">{metrics.communication?.speakingPaceWPM || 0} WPM</span>
                </div>
                <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                  <div className="bg-[#8b5cf6] h-full" style={{width: `${Math.min((metrics.communication?.speakingPaceWPM || 0)/2, 100)}%`}}></div>
                </div>
                
                <div className="flex justify-between items-center text-sm pt-2">
                  <span className="text-on-surface-variant">Filler Words Count</span>
                  <span className="font-mono font-bold text-[#b45309]">{metrics.communication?.fillerWordCount || 0} detected</span>
                </div>
                
                <div className="flex justify-between items-center text-sm pt-2">
                  <span className="text-on-surface-variant">Clarity Score</span>
                  <span className="font-mono font-bold text-on-surface">{metrics.communication?.clarityScore || 0}/100</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-on-surface-variant">Conciseness</span>
                  <span className="font-mono font-bold text-on-surface">{metrics.communication?.concisenessScore || 0}/100</span>
                </div>
              </div>
            </div>

            {/* Technical Panel */}
            <div className="glass-card p-6 border-t-4 border-t-[#0ea5e9]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg flex items-center gap-2"><BrainCircuit size={20} className="text-[#0ea5e9]"/> Technical</h3>
                <span className="text-2xl font-black text-[#0ea5e9]">{metrics.technical?.score}/100</span>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-on-surface-variant">Depth of Knowledge</span>
                  <span className="font-mono font-bold text-on-surface">{metrics.technical?.depthOfKnowledge || 0}/100</span>
                </div>
                <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                  <div className="bg-[#0ea5e9] h-full" style={{width: `${metrics.technical?.depthOfKnowledge || 0}%`}}></div>
                </div>
                <div className="flex justify-between items-center text-sm pt-2">
                  <span className="text-on-surface-variant">Problem Solving</span>
                  <span className="font-mono font-bold text-on-surface">{metrics.technical?.problemSolving || 0}/100</span>
                </div>
                <div className="flex justify-between items-center text-sm pt-2">
                  <span className="text-on-surface-variant">Best Practices</span>
                  <span className="font-mono font-bold text-on-surface">{metrics.technical?.bestPractices || 0}/100</span>
                </div>
              </div>
            </div>

            {/* Behavioral Panel */}
            <div className="glass-card p-6 border-t-4 border-t-[#ec4899]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg flex items-center gap-2"><UserCheck size={20} className="text-[#ec4899]"/> Behavioral</h3>
                <span className="text-2xl font-black text-[#ec4899]">{metrics.behavioral?.score}/100</span>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-on-surface-variant">Confidence Level</span>
                  <span className="font-mono font-bold text-on-surface">{metrics.behavioral?.confidenceScore || 0}/100</span>
                </div>
                <div className="flex justify-between items-center text-sm pt-2">
                  <span className="text-on-surface-variant">STAR Method Adherence</span>
                  <span className="font-mono font-bold text-on-surface">{metrics.behavioral?.starAdherence || 0}%</span>
                </div>
                <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                  <div className="bg-[#ec4899] h-full" style={{width: `${metrics.behavioral?.starAdherence || 0}%`}}></div>
                </div>
                <div className="flex justify-between items-center text-sm pt-2">
                  <span className="text-on-surface-variant">Decision Making</span>
                  <span className="font-mono font-bold text-on-surface">{metrics.behavioral?.decisionMaking || 0}/100</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MIDDLE SECTION: Heatmap & Predicted Fit */}
      <div className="grid lg:grid-cols-3 gap-6 mb-12">
        {/* Topic Heatmap */}
        {topicHeatmap && topicHeatmap.length > 0 && (
          <div className="glass-card p-6 lg:col-span-2 border border-outline-variant/30">
            <h3 className="font-bold text-lg flex items-center gap-2 mb-6"><Target className="text-primary"/> Topic Heatmap</h3>
            <div className="space-y-4">
              {topicHeatmap.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <span className="w-1/3 text-sm font-medium text-on-surface truncate">{item.topic}</span>
                  <div className="flex-1 bg-surface-container-high h-4 rounded-full overflow-hidden flex">
                    <div 
                      className={`h-full ${item.score >= 80 ? 'bg-[#00855b]' : item.score >= 50 ? 'bg-[#b45309]' : 'bg-error'}`} 
                      style={{width: `${item.score}%`}}
                    ></div>
                  </div>
                  <span className="w-12 text-right font-mono font-bold text-sm">{item.score}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Predicted Role Fit */}
        {predictedRoleFit && predictedRoleFit.length > 0 && (
          <div className="glass-card p-6 border border-outline-variant/30">
            <h3 className="font-bold text-lg flex items-center gap-2 mb-6"><Briefcase className="text-primary"/> Predicted Role Fit</h3>
            <div className="space-y-5">
              {predictedRoleFit.map((role, idx) => (
                <div key={idx} className="relative">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-bold text-on-surface">{role.role}</span>
                    <span className="font-black text-primary">{role.percentage}%</span>
                  </div>
                  <div className="w-full bg-surface-container h-3 rounded-full overflow-hidden">
                    <div className="bg-primary h-full" style={{width: `${role.percentage}%`}}></div>
                  </div>
                </div>
              ))}
            </div>
            
            {missingKeywords && missingKeywords.length > 0 && (
              <div className="mt-8 pt-6 border-t border-outline-variant/30">
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">Missing Keywords</p>
                <div className="flex flex-wrap gap-2">
                  {missingKeywords.map((kw, i) => (
                    <span key={i} className="px-2 py-1 bg-error-container text-on-error-container text-xs rounded font-medium border border-error/20">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actionable Weaknesses / Areas for Improvement */}
      {areasForImprovement && areasForImprovement.length > 0 && (
        <div className="glass-card p-6 lg:p-8 mb-12 border-t-4 border-t-error/80 bg-error-container/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Zap size={100} className="text-error" />
          </div>
          <h3 className="text-2xl font-bold text-error flex items-center gap-3 mb-3 relative z-10">
            <AlertTriangle size={28} /> Areas for Improvement
          </h3>
          <p className="text-on-surface-variant mb-6 font-medium relative z-10 max-w-2xl">
            Click on any weakness below to instantly generate a tailored reading list or a 5-question micro-quiz using the Doubt Solver engine.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
            {areasForImprovement.map((area, idx) => (
              <button 
                key={idx} 
                onClick={() => handleGenerateQuiz(area)}
                className="text-left bg-surface-container-lowest border border-error/20 p-4 rounded-xl hover:border-error hover:bg-error-container/20 transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between group/btn"
              >
                <span className="font-bold text-on-surface mb-3 line-clamp-3 leading-relaxed">{area}</span>
                <span className="text-xs font-bold text-error uppercase tracking-wider flex items-center gap-1 group-hover/btn:gap-2 transition-all">
                  Fix this gap <ArrowLeft className="w-3 h-3 rotate-180" />
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* IMPROVEMENT PLAN */}
      {sevenDayImprovementPlan && sevenDayImprovementPlan.length > 0 && (
        <div className="glass-card p-8 mb-12 border-l-4 border-l-primary bg-primary/5">
          <h3 className="text-2xl font-bold text-primary flex items-center gap-3 mb-6">
            <Calendar size={28} /> Personalized 7-Day Improvement Plan
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {sevenDayImprovementPlan.map((plan, idx) => (
              <div key={idx} className="flex items-start gap-3 bg-surface p-4 rounded-xl border border-primary/20">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-on-primary text-xs font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-on-surface leading-relaxed text-sm font-medium">{plan}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-3xl font-black text-on-surface mb-8 flex items-center gap-3 border-b border-outline-variant/30 pb-4">
        <TrendingUp className="text-primary" size={32} /> Transcript & Response Analytics
      </h2>
      
      <div className="space-y-8">
        {detailedFeedback?.map((item, idx) => (
          <div key={idx} className="glass-card p-0 overflow-hidden transition-all hover:shadow-xl border border-outline-variant/40">
            {/* Question Header */}
            <div className="bg-surface-container-low p-6 border-b border-outline-variant/30 flex justify-between items-start gap-6">
              <h4 className="text-xl font-bold text-on-surface leading-relaxed flex-1">
                <span className="inline-block bg-primary text-on-primary px-3 py-1 rounded-lg text-sm mr-3 -translate-y-1">Q{idx + 1}</span> 
                {item.question}
              </h4>
              <div className="shrink-0 text-center bg-surface px-4 py-2 rounded-xl shadow-sm border border-outline-variant/50">
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Score</p>
                <p className={`text-2xl font-black ${item.score >= 8 ? 'text-[#00855b]' : item.score >= 5 ? 'text-[#b45309]' : 'text-error'}`}>
                  {item.score}<span className="text-sm text-on-surface-variant">/10</span>
                </p>
              </div>
            </div>
            
            <div className="p-6 md:p-8 grid lg:grid-cols-2 gap-8">
              {/* Left Column: User Transcript & Highlights */}
              <div className="space-y-6">
                <div>
                  <p className="text-sm uppercase tracking-widest text-on-surface-variant font-bold mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">record_voice_over</span> Your Transcript
                  </p>
                  <div className="bg-surface-container/50 p-5 rounded-xl border border-outline-variant/30 italic text-on-surface leading-relaxed text-lg">
                    "{item.candidateAnswer}"
                  </div>
                </div>

                {(item.weakStatements?.length > 0 || item.strongStatements?.length > 0) && (
                  <div className="space-y-3">
                    {item.weakStatements?.map((stmt, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm bg-error-container/30 p-3 rounded-lg border border-error/20 text-on-surface">
                        <AlertCircle size={16} className="text-error shrink-0 mt-0.5" />
                        <span><span className="font-bold text-error">Weak:</span> "{stmt}"</span>
                      </div>
                    ))}
                    {item.strongStatements?.map((stmt, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm bg-[#00855b]/10 p-3 rounded-lg border border-[#00855b]/20 text-on-surface">
                        <CheckCircle2 size={16} className="text-[#00855b] shrink-0 mt-0.5" />
                        <span><span className="font-bold text-[#00855b]">Strong:</span> "{stmt}"</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Right Column: AI Feedback & Suggestions */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm uppercase tracking-widest text-primary font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">smart_toy</span> AI Analysis
                    </p>
                    {item.sentiment && (
                      <span className={`text-xs font-bold px-2 py-1 rounded border ${item.sentiment.toLowerCase() === 'positive' ? 'bg-[#00855b]/10 text-[#00855b] border-[#00855b]/20' : 'bg-[#b45309]/10 text-[#b45309] border-[#b45309]/20'}`}>
                        {item.sentiment} Sentiment
                      </span>
                    )}
                  </div>
                  <div className="text-on-surface leading-relaxed p-1">
                    {item.feedback}
                  </div>
                </div>

                {item.suggestedAnswer && (
                  <div className="bg-primary/5 p-5 rounded-xl border border-primary/20 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                    <p className="text-xs uppercase tracking-widest text-primary font-bold mb-2 flex items-center gap-2">
                      <Zap size={14} /> Recommended Structure
                    </p>
                    <p className="text-on-surface leading-relaxed text-sm">
                      {item.suggestedAnswer}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Feedback;
