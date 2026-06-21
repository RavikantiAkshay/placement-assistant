import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { getInterview, submitTextAnswer } from '../services/interview.service';
import ConversationalMic from '../components/ConversationalMic';
import NativeAudioPlayer from '../components/NativeAudioPlayer';
import { Loader2 } from 'lucide-react';

const LiveInterview = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [status, setStatus] = useState('loading'); // loading, speaking, listening, thinking, completed
  const [currentQuestionText, setCurrentQuestionText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // If we just navigated from Setup, use the initial message immediately
    if (location.state?.firstMessage) {
      setCurrentQuestionText(location.state.firstMessage);
      setStatus('speaking');
    } else {
      // Otherwise fetch from DB to resume
      const fetchInterview = async () => {
        try {
          const data = await getInterview(id);
          if (data.status === 'completed') {
            setStatus('completed');
            return;
          }
          // Resume from the last AI message
          const aiMessages = data.messages.filter(m => m.role === 'ai');
          const lastMessage = aiMessages[aiMessages.length - 1];
          if (lastMessage) {
            setCurrentQuestionText(lastMessage.content);
            setStatus('speaking');
          } else {
            setStatus('listening');
          }
        } catch (err) {
          setError('Failed to load interview session.');
          setStatus('error');
        }
      };
      fetchInterview();
    }
  }, [id, location.state]);

  const handleAudioPlaybackEnded = () => {
    if (status === 'speaking') {
      setStatus('listening');
    }
  };

  const handleAnswerSubmit = async (answerText) => {
    try {
      setStatus('thinking');
      const response = await submitTextAnswer(id, answerText);
      
      setCurrentQuestionText(response.aiResponse);
      
      if (response.isCompleted) {
        setStatus('speaking'); // Speak the farewell message
        setTimeout(() => {
          setStatus('completed');
          navigate('/history'); // Navigate to history/feedback after short delay
        }, 8000);
      } else {
        setStatus('speaking'); // Speak the next question
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit answer.');
      setStatus('listening'); // Let them try again
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex h-[calc(100vh-73px)] items-center justify-center">
        <Loader2 size={32} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto w-full px-6 py-12 flex flex-col items-center">
      
      {/* Header */}
      <div className="w-full flex justify-between items-center mb-8 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${status === 'speaking' ? 'bg-green-500 animate-pulse' : status === 'listening' ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'}`}></div>
          <span className="text-sm font-semibold text-gray-700 capitalize">Status: {status}</span>
        </div>
        <button 
          onClick={() => navigate('/history')}
          className="text-sm text-gray-500 hover:text-gray-800"
        >
          Pause / Exit
        </button>
      </div>

      {error && (
        <div className="w-full bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200">
          {error}
        </div>
      )}

      {/* AI Interviewer UI */}
      <div className="flex flex-col items-center mb-12">
        <div className={`relative w-48 h-48 rounded-full overflow-hidden border-4 transition-all duration-300 ${status === 'speaking' ? 'border-green-400 shadow-[0_0_30px_rgba(74,222,128,0.4)]' : 'border-gray-200'}`}>
          {/* Avatar Placeholder: using a stylized UI avatar or user provided one */}
          <img 
            src="https://ui-avatars.com/api/?name=Natalie+AI&background=0058be&color=fff&size=200" 
            alt="Natalie AI"
            className="w-full h-full object-cover"
          />
        </div>
        <h3 className="mt-4 text-xl font-bold text-gray-900">Natalie</h3>
        <p className="text-sm text-gray-500">AI Technical Interviewer</p>
      </div>

      {/* Captions / Current Question text */}
      <div className="w-full max-w-2xl bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-12 min-h-[100px] flex items-center justify-center text-center">
        {status === 'thinking' ? (
          <div className="flex items-center gap-2 text-indigo-600">
            <Loader2 size={20} className="animate-spin" />
            <span className="font-medium">Natalie is thinking...</span>
          </div>
        ) : (
          <p className="text-lg text-gray-800 font-medium leading-relaxed">
            {currentQuestionText || "Listening..."}
          </p>
        )}
      </div>

      {/* Mic Input */}
      <div className="w-full flex justify-center">
        <ConversationalMic 
          disabled={status !== 'listening'} 
          onAnswerSubmit={handleAnswerSubmit} 
        />
      </div>

      {/* Native TTS Headless Player */}
      <NativeAudioPlayer 
        text={status === 'speaking' ? currentQuestionText : ''}
        autoPlay={status === 'speaking'}
        onEnded={handleAudioPlaybackEnded}
      />

    </div>
  );
};

export default LiveInterview;
