import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadResume, startInterview } from '../services/interview.service';
import { UploadCloud, ArrowRight, Brain, Loader2, Settings2, Code, Database, Layout, ChartBar, Briefcase } from 'lucide-react';

const ROLES = [
  { id: 'frontend', label: 'Frontend', icon: Layout },
  { id: 'backend', label: 'Backend', icon: Database },
  { id: 'fullstack', label: 'Full Stack', icon: Code },
  { id: 'data_scientist', label: 'Data Science', icon: ChartBar },
  { id: 'product_manager', label: 'Product Mgr', icon: Briefcase },
  { id: 'custom', label: 'Custom', icon: Settings2 },
];

const InterviewSetup = () => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [difficulty, setDifficulty] = useState('mid');
  const [duration, setDuration] = useState('15');
  const [persona, setPersona] = useState('standard');
  const [file, setFile] = useState(null);
  const [useManualText, setUseManualText] = useState(false);
  const [manualResumeText, setManualResumeText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleNext = () => {
    if (step === 1 && !role) {
      setError('Please select a target role to proceed.');
      return;
    }
    if (step === 1 && role === 'custom' && !customRole.trim()) {
      setError('Please enter your custom role to proceed.');
      return;
    }
    setError('');
    setStep(step + 1);
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type === 'application/pdf') {
      setFile(selected);
      setError('');
    } else {
      setError('Please select a valid PDF file.');
    }
  };

  const handleStart = async () => {
    if (!useManualText && !file) {
      setError('Please upload your resume to continue.');
      return;
    }
    if (useManualText && !manualResumeText.trim()) {
      setError('Please paste your resume text to continue.');
      return;
    }

    try {
      setIsUploading(true);
      setError('');
      
      let extractedText = '';
      if (useManualText) {
        extractedText = manualResumeText.trim();
      } else {
        const resumeData = await uploadResume(file);
        extractedText = resumeData.text;
      }
      
      const finalRole = role === 'custom' ? customRole.trim() : role;
      const questionsCount = Math.max(2, Math.round(parseInt(duration) / 3)); // Approx 3 mins per question

      const interviewData = await startInterview(finalRole, difficulty, extractedText, questionsCount, persona);
      
      navigate(`/interview/${interviewData.interviewId}`, { 
        state: { firstMessage: interviewData.firstMessage } 
      });

    } catch (err) {
      const errorMsg = err.response?.data?.message;
      if (errorMsg?.includes('Could not extract text')) {
        setUseManualText(true);
        setError('PDF extraction failed (scanned or complex layout). Please paste your resume text manually below.');
      } else {
        setError(errorMsg || 'Failed to start interview. Please try again.');
      }
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto w-full px-6 py-10 flex flex-col lg:flex-row gap-12 relative z-10 min-h-[calc(100vh-73px)] items-center">
      
      {/* Left Column - Information / Branding */}
      <div className="w-full lg:w-5/12 flex flex-col gap-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary-container/20 text-primary shadow-inner border border-primary/10">
          <Settings2 size={40} />
        </div>
        
        <div>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-on-surface mb-6 tracking-tight leading-tight">
            Configure Your <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#00a8ff] pr-2 pb-1">Session</span>
          </h2>
          <p className="text-lg text-on-surface-variant font-medium leading-relaxed max-w-md">
            Personalize your mock interview. Our AI Agent uses your target role and resume context to generate highly specific, challenging questions tailored to your experience level.
          </p>
        </div>

        <div className="space-y-6 mt-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary shrink-0"><Brain size={18}/></div>
            <div>
              <h4 className="font-bold text-on-surface">Dynamic Difficulty</h4>
              <p className="text-on-surface-variant text-sm mt-1 leading-relaxed">Agent AI adjusts its rigor based on the seniority level you select.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary shrink-0"><Briefcase size={18}/></div>
            <div>
              <h4 className="font-bold text-on-surface">Role-Specific Focus</h4>
              <p className="text-on-surface-variant text-sm mt-1 leading-relaxed">System Design for Backend, React for Frontend, or Algorithms for Data Science.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Configuration Form */}
      <div className="w-full lg:w-7/12">
        <div className="glass-card p-10 relative overflow-hidden shadow-[0_8px_40px_rgb(0,0,0,0.08)] border border-outline-variant/40 rounded-[2rem]">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[60px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>

          {error && (
            <div className="bg-error-container/50 text-on-error-container p-4 rounded-xl mb-8 border border-error/20 flex items-start gap-3 animate-in fade-in">
              <span className="material-symbols-outlined text-error">error</span>
              <span className="font-medium text-sm">{error}</span>
            </div>
          )}

          {/* Progress Indicator */}
          <div className="flex items-center gap-4 mb-10 border-b border-outline-variant/30 pb-6">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= 1 ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-surface-container text-on-surface-variant'}`}>1</div>
              <span className={`text-sm font-bold tracking-wide ${step >= 1 ? 'text-on-surface' : 'text-on-surface-variant'}`}>Parameters</span>
            </div>
            <div className={`h-0.5 w-12 transition-colors ${step >= 2 ? 'bg-primary' : 'bg-surface-container-high'}`}></div>
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= 2 ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-surface-container text-on-surface-variant'}`}>2</div>
              <span className={`text-sm font-bold tracking-wide ${step >= 2 ? 'text-on-surface' : 'text-on-surface-variant'}`}>Context</span>
            </div>
          </div>

          {step === 1 ? (
            <div className="space-y-10 relative z-10 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-4">
                <label className="text-sm font-extrabold text-on-surface uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Select Target Role
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {ROLES.map((r) => {
                    const Icon = r.icon;
                    return (
                      <button
                        key={r.id}
                        onClick={() => setRole(r.id)}
                        className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border transition-all duration-200 ${
                          role === r.id 
                            ? 'border-primary bg-primary-container/10 text-primary shadow-md shadow-primary/5 scale-[1.02]' 
                            : 'border-outline-variant/50 bg-surface-container-lowest/50 text-on-surface-variant hover:border-primary/40 hover:bg-surface-container/50'
                        }`}
                      >
                        <Icon size={28} className={role === r.id ? 'text-primary' : 'opacity-70'} />
                        <span className="text-sm font-bold">{r.label}</span>
                      </button>
                    )
                  })}
                </div>
                {role === 'custom' && (
                  <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                    <input 
                      type="text" 
                      placeholder="e.g., iOS Developer, Machine Learning Engineer..." 
                      className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary transition-colors text-on-surface"
                      value={customRole}
                      onChange={(e) => setCustomRole(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <label className="text-sm font-extrabold text-on-surface uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]"></span> Interview Duration
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {['5', '10', '15', '30'].map((mins) => (
                    <label key={mins} className="cursor-pointer group">
                      <input 
                        type="radio" 
                        name="duration" 
                        value={mins} 
                        className="peer sr-only"
                        checked={duration === mins}
                        onChange={(e) => setDuration(e.target.value)}
                      />
                      <div className="border border-outline-variant/50 rounded-xl p-3.5 text-center transition-all duration-200 peer-checked:border-[#3b82f6] peer-checked:bg-[#3b82f6]/5 peer-checked:text-[#3b82f6] hover:border-[#3b82f6]/40 hover:bg-surface-container/50 bg-surface-container-lowest/50 shadow-sm peer-checked:shadow-md peer-checked:shadow-[#3b82f6]/5">
                        <span className="block text-sm font-bold capitalize">{mins} min</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-extrabold text-on-surface uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00855b]"></span> Experience Level
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['junior', 'mid', 'senior'].map((level) => (
                    <label key={level} className="cursor-pointer group">
                      <input 
                        type="radio" 
                        name="difficulty" 
                        value={level} 
                        className="peer sr-only"
                        checked={difficulty === level}
                        onChange={(e) => setDifficulty(e.target.value)}
                      />
                      <div className="border border-outline-variant/50 rounded-xl p-3.5 text-center transition-all duration-200 peer-checked:border-[#00855b] peer-checked:bg-[#00855b]/5 peer-checked:text-[#00855b] hover:border-[#00855b]/40 hover:bg-surface-container/50 bg-surface-container-lowest/50 shadow-sm peer-checked:shadow-md peer-checked:shadow-[#00855b]/5">
                        <span className="block text-sm font-bold capitalize">{level}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-extrabold text-on-surface uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6]"></span> AI Persona
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'friendly', label: 'Supportive', desc: 'Offers hints' },
                    { id: 'standard', label: 'Standard', desc: 'Professional' },
                    { id: 'stress', label: 'Stress Test', desc: 'Aggressive' }
                  ].map((p) => (
                    <label key={p.id} className="cursor-pointer group">
                      <input 
                        type="radio" 
                        name="persona" 
                        value={p.id} 
                        className="peer sr-only"
                        checked={persona === p.id}
                        onChange={(e) => setPersona(e.target.value)}
                      />
                      <div className="border border-outline-variant/50 rounded-xl p-2.5 text-center transition-all duration-200 peer-checked:border-[#8b5cf6] peer-checked:bg-[#8b5cf6]/5 peer-checked:text-[#8b5cf6] hover:border-[#8b5cf6]/40 hover:bg-surface-container/50 bg-surface-container-lowest/50 shadow-sm peer-checked:shadow-md peer-checked:shadow-[#8b5cf6]/5 flex flex-col items-center justify-center">
                        <span className="block text-sm font-bold">{p.label}</span>
                        <span className="block text-[11px] font-bold text-on-surface-variant group-hover:text-inherit transition-colors mt-0.5">{p.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end pt-4">
                <button 
                  onClick={handleNext}
                  className="btn-primary py-3.5 px-8 font-bold flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                  Continue to Resume Upload <ArrowRight size={18} />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8 relative z-10 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-4">
                <label className="text-sm font-extrabold text-on-surface uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Provide Resume Context
                </label>
                <p className="text-sm text-on-surface-variant font-medium mb-4">We extract your experience to ask highly contextual questions during the interview.</p>
                
                {useManualText ? (
                  <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                    <textarea 
                      value={manualResumeText}
                      onChange={(e) => setManualResumeText(e.target.value)}
                      placeholder="Paste your resume content, experience, and skills here..."
                      className="w-full h-48 bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-5 text-sm focus:outline-none focus:border-primary custom-scrollbar text-on-surface leading-relaxed shadow-inner"
                    />
                    <div className="flex justify-end">
                      <button 
                        onClick={() => { setUseManualText(false); setError(''); }} 
                        className="text-sm font-bold text-primary hover:underline"
                      >
                        Try uploading PDF instead
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                    <label className="border-2 border-dashed border-outline-variant rounded-[2rem] p-12 bg-surface-container-lowest/50 backdrop-blur-sm flex flex-col items-center justify-center gap-5 transition-all duration-300 hover:border-primary hover:bg-primary-container/5 cursor-pointer group shadow-inner">
                      <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary-container/20 transition-all duration-300 shadow-sm">
                        <UploadCloud size={36} />
                      </div>
                      <div className="text-center space-y-2">
                        <p className="text-lg font-bold text-on-surface">
                          {file ? file.name : "Drag & Drop your resume here"}
                        </p>
                        <p className="text-sm text-on-surface-variant">
                          or <span className="text-primary font-bold group-hover:underline">browse files</span>
                        </p>
                        {!file && <p className="text-xs text-on-surface-variant/70 font-bold uppercase tracking-wider mt-4">PDF format • Max 5MB</p>}
                      </div>
                      <input 
                        type="file" 
                        accept="application/pdf" 
                        className="hidden" 
                        onChange={handleFileChange}
                      />
                    </label>
                    <div className="text-center mt-4">
                      <button 
                        onClick={() => { setUseManualText(true); setError(''); }} 
                        className="text-xs font-bold text-on-surface-variant hover:text-primary hover:underline transition-colors"
                      >
                        PDF Extraction Failing? Paste manually instead
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-between gap-4 pt-8 mt-4 border-t border-outline-variant/30">
                <button 
                  onClick={() => setStep(1)}
                  className="btn-secondary py-3.5 px-8 font-bold text-center"
                  disabled={isUploading}
                >
                  Back
                </button>
                <button 
                  onClick={handleStart}
                  disabled={isUploading || (!useManualText && !file) || (useManualText && !manualResumeText.trim())}
                  className={`btn-primary py-3.5 px-8 font-bold flex justify-center items-center gap-2 ${((!useManualText && !file) || (useManualText && !manualResumeText.trim())) && !isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isUploading ? (
                    <><Loader2 size={20} className="animate-spin" /> Preparing Agent...</>
                  ) : (
                    <><Brain size={20} /> Begin Interview</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewSetup;
