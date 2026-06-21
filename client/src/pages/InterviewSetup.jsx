import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadResume, startInterview } from '../services/interview.service';
import { UploadCloud, ArrowRight, Brain, Loader2 } from 'lucide-react';

const InterviewSetup = () => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('');
  const [difficulty, setDifficulty] = useState('mid');
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleNext = () => {
    if (step === 1 && !role) {
      setError('Please select a target role.');
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
    if (!file) {
      setError('Please upload your resume.');
      return;
    }

    try {
      setIsUploading(true);
      setError('');
      
      // 1. Upload Resume and extract text
      const resumeData = await uploadResume(file);
      const extractedText = resumeData.text;

      // 2. Start Interview by passing data to AI
      const interviewData = await startInterview(role, difficulty, extractedText, 5);
      
      // 3. Navigate to live interview page
      navigate(`/interview/${interviewData.interviewId}`, { 
        state: { firstMessage: interviewData.firstMessage } 
      });

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start interview. Please try again.');
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full px-6 py-12 flex flex-col">
      <div className="mb-8 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-2">Configure Interview</h2>
        <p className="text-lg text-gray-600">Set the parameters for your upcoming mock session.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200">
          {error}
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-12 relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 rounded-full -translate-y-1/2 z-0"></div>
        <div 
          className="absolute top-1/2 left-0 h-1 bg-indigo-600 rounded-full -translate-y-1/2 z-0 transition-all duration-300"
          style={{ width: step === 1 ? '50%' : '100%' }}
        ></div>
        
        <div className="relative z-10 flex justify-between">
          <div className="flex flex-col items-center gap-2 w-1/2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shadow-sm border-2 border-white ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>1</div>
            <span className={`text-sm font-medium ${step >= 1 ? 'text-indigo-600' : 'text-gray-500'}`}>Role & Difficulty</span>
          </div>
          <div className="flex flex-col items-center gap-2 w-1/2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shadow-sm border-2 border-white ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>2</div>
            <span className={`text-sm font-medium ${step >= 2 ? 'text-indigo-600' : 'text-gray-500'}`}>Resume Upload</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 flex-1">
        {step === 1 ? (
          <div className="space-y-8">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-900">Target Role</label>
              <select 
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="" disabled>Select a role...</option>
                <option value="frontend">Frontend Developer</option>
                <option value="backend">Backend Developer</option>
                <option value="fullstack">Full Stack Engineer</option>
                <option value="data_scientist">Data Scientist</option>
                <option value="product_manager">Product Manager</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-900">Difficulty Level</label>
              <div className="grid grid-cols-3 gap-4">
                {['junior', 'mid', 'senior'].map((level) => (
                  <label key={level} className="cursor-pointer">
                    <input 
                      type="radio" 
                      name="difficulty" 
                      value={level} 
                      className="peer sr-only"
                      checked={difficulty === level}
                      onChange={(e) => setDifficulty(e.target.value)}
                    />
                    <div className="border border-gray-200 rounded-lg p-4 text-center transition-all peer-checked:border-indigo-600 peer-checked:bg-indigo-50 peer-checked:text-indigo-700 hover:bg-gray-50">
                      <span className="block text-sm font-semibold capitalize">{level}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <button 
                onClick={handleNext}
                className="px-8 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                Next Step <ArrowRight size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-900">Resume Context</label>
              </div>
              <label className="border-2 border-dashed border-gray-300 rounded-xl p-10 bg-gray-50 flex flex-col items-center justify-center gap-4 transition-colors hover:border-indigo-600 hover:bg-indigo-50/50 cursor-pointer">
                <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <UploadCloud size={32} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-900">
                    {file ? file.name : "Drag & Drop your resume here, or click to browse"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">PDF format up to 5MB</p>
                </div>
                <input 
                  type="file" 
                  accept="application/pdf" 
                  className="hidden" 
                  onChange={handleFileChange}
                />
              </label>
            </div>

            <div className="flex justify-between pt-4">
              <button 
                onClick={() => setStep(1)}
                className="px-6 py-3 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                disabled={isUploading}
              >
                Back
              </button>
              <button 
                onClick={handleStart}
                disabled={isUploading}
                className="px-8 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-70"
              >
                {isUploading ? (
                  <><Loader2 size={18} className="animate-spin" /> Preparing AI...</>
                ) : (
                  <><Brain size={18} /> Start Interview</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewSetup;
