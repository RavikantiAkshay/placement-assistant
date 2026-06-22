import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { getInterview, submitTextAnswer, transcribeAudioFile } from '../services/interview.service';
import ConversationalMic from '../components/ConversationalMic';
import NativeAudioPlayer from '../components/NativeAudioPlayer';

const LiveInterview = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [status, setStatus] = useState('loading'); // loading, speaking, listening, thinking, completed
  const [currentQuestionText, setCurrentQuestionText] = useState('');
  const [userTranscript, setUserTranscript] = useState('');
  const [error, setError] = useState('');
  const [interview, setInterview] = useState(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const data = await getInterview(id);
        setInterview(data);
        if (data.status === 'completed') {
          setStatus('completed');
          return;
        }

        if (location.state?.firstMessage) {
          setCurrentQuestionText(location.state.firstMessage);
          setStatus('speaking');
        } else {
          const aiMessages = data.messages?.filter(m => m.role === 'ai') || [];
          const lastMessage = aiMessages[aiMessages.length - 1];
          if (lastMessage) {
            setCurrentQuestionText(lastMessage.content);
            setStatus('speaking');
          } else {
            setStatus('listening');
          }
        }
      } catch (err) {
        setError('Failed to load interview session.');
        setStatus('error');
      }
    };
    fetchInterview();
  }, [id, location.state]);

  const handleAudioPlaybackEnded = () => {
    if (status === 'speaking') {
      setStatus('listening');
    }
  };

  const handleAnswerSubmit = async (answerText, audioBlob) => {
    try {
      setUserTranscript('');
      
      let finalTranscriptText = answerText;
      
      // If we have an audio recording, use Groq Whisper for professional accuracy
      if (audioBlob) {
        setStatus('thinking');
        setCurrentQuestionText('Transcribing audio (Groq Whisper)...');
        try {
          const accurateText = await transcribeAudioFile(audioBlob);
          if (accurateText && accurateText.trim().length > 0) {
            finalTranscriptText = accurateText;
          }
        } catch (transcribeErr) {
          console.error("Whisper transcription failed, falling back to browser text:", transcribeErr);
        }
      }

      if (!finalTranscriptText) {
         setStatus('listening');
         return;
      }

      setStatus('thinking');
      setCurrentQuestionText('Analyzing your answer...');
      const response = await submitTextAnswer(id, finalTranscriptText);
      
      setCurrentQuestionText(response.aiResponse);
      
      if (response.isCompleted) {
        setStatus('speaking');
        setTimeout(() => {
          setStatus('completed');
          navigate('/history'); 
        }, 8000);
      } else {
        setStatus('speaking'); 
      }
    } catch (err) {
      setError('Failed to submit answer. Please try again.');
      setStatus('listening');
    }
  };

  const handleInterrupt = () => {
    if (status === 'speaking') {
      window.speechSynthesis.cancel();
      setStatus('listening');
    }
  };

  if (status === 'loading' || !interview) {
    return (
      <div className="flex h-[calc(100vh-73px)] items-center justify-center bg-background">
        <div className="text-on-surface-variant font-medium text-lg flex items-center gap-3">
           <span className="material-symbols-outlined animate-spin text-primary">sync</span>
           Connecting to session...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-background h-[calc(100vh-73px)] flex flex-col overflow-hidden font-body-md antialiased w-full relative">

      {error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-error-container text-on-error-container px-6 py-3 rounded-xl border border-error shadow-lg">
          {error}
        </div>
      )}

      {status === 'speaking' && !hasInteracted && (
        <div className="absolute inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <button 
            onClick={() => setHasInteracted(true)}
            className="px-8 py-4 bg-primary text-on-primary rounded-full shadow-xl hover:bg-surface-tint flex items-center gap-3 font-label-lg text-xl transition-transform hover:scale-105"
          >
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
            Begin Interview
          </button>
        </div>
      )}

      <main className="flex-1 w-full max-w-[1400px] mx-auto p-4 md:p-6 gap-6 flex flex-col h-full overflow-hidden">
        
        {/* TOP: Transcript / Question Area (Full Width) */}
        <div className="bg-surface border border-outline-variant rounded-xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] shrink-0 flex flex-col relative transition-all min-h-[120px] max-h-[35vh] overflow-y-auto w-full custom-scrollbar">
          {status === 'thinking' && (
            <div className="absolute top-0 left-0 w-full h-1 bg-surface-tint animate-pulse"></div>
          )}
          {(status === 'speaking' || status === 'listening') && (
            <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
          )}
          
          <div className="flex items-center gap-2 mb-3 border-b border-outline-variant pb-2 shrink-0">
            <span className={`material-symbols-outlined ${userTranscript ? 'text-error animate-pulse' : 'text-primary'} text-[20px]`}>
              {userTranscript ? 'mic' : 'forum'}
            </span>
            <h2 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              {userTranscript ? 'Your Answer (Live Transcript)' : 'Current Question'}
            </h2>
          </div>
          <p className={`font-body-lg text-body-lg ${userTranscript ? 'text-on-surface italic' : 'text-on-surface'} leading-relaxed`}>
            {userTranscript ? `"${userTranscript}"` : `"${currentQuestionText}"`}
          </p>
        </div>

        {/* BOTTOM: Split layout */}
        <div className="flex flex-col md:flex-row gap-6 flex-1 overflow-hidden w-full">
          
          {/* Left Column: AI Coach & Interaction */}
          <section className="w-full md:w-5/12 lg:w-4/12 flex flex-col gap-5 h-full overflow-y-auto custom-scrollbar pb-2">
            
            {/* AI Video Interface (Reduced Size) */}
            <div className={`relative w-96 max-w-full aspect-[4/3] mx-auto rounded-2xl overflow-hidden shadow-sm border-2 transition-all duration-300 ${status === 'speaking' ? 'border-primary shadow-[0_0_20px_rgba(0,88,190,0.3)]' : 'border-outline-variant bg-surface-container-low'} shrink-0 group`}>
              <img 
                alt="AI Avatar" 
                className={`w-full h-full object-cover transition-transform duration-[3s] ${status === 'speaking' ? 'scale-105' : 'scale-100'}`} 
                src="/ai-avatar.jpg" 
              />
              
              {status === 'thinking' && (
                <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-3xl animate-spin">sync</span>
                </div>
              )}
            </div>
            
            {/* Recording Controls */}
            <ConversationalMic 
              disabled={status !== 'listening'} 
              status={status}
              onAnswerSubmit={handleAnswerSubmit} 
              onTranscriptChange={setUserTranscript}
              onInterrupt={handleInterrupt}
            />

          </section>
          
          {/* Right Column: Code Editor (Inactive State) */}
          <section className="w-full md:w-7/12 lg:w-8/12 h-full bg-surface border border-outline-variant rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] flex flex-col overflow-hidden hidden md:flex">
            {/* Editor Header Tabs */}
            <div className="flex items-center justify-between bg-surface-container-lowest border-b border-outline-variant px-4 h-12 shrink-0">
              <div className="flex h-full">
                <div className="h-full px-4 flex items-center gap-2 border-b-2 border-primary bg-surface font-label-sm text-label-sm text-primary cursor-pointer">
                  <span className="material-symbols-outlined text-[16px]">code_blocks</span>
                  solution.py
                </div>
              </div>
              <button 
                onClick={() => navigate('/history')}
                className="flex items-center gap-2 px-3 py-1.5 border border-error/50 text-error rounded hover:bg-error-container hover:border-error transition-colors font-label-sm text-label-sm"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                End Session
              </button>
            </div>
            
            {/* Editor Body - Empty State */}
            <div className="flex-1 bg-[#FAFAFA] flex items-center justify-center font-mono text-body-sm relative group p-8 text-center">
               <div className="flex flex-col items-center opacity-60">
                  <span className="material-symbols-outlined text-5xl mb-4 text-on-surface-variant">code_off</span>
                  <h3 className="font-label-md text-lg text-on-surface-variant mb-2">Code Editor Inactive</h3>
                  <p className="text-on-surface-variant max-w-sm">This question is conversational and does not require writing code. Continue your discussion using the microphone.</p>
               </div>
            </div>
            
            {/* Editor Console/Output Footer */}
            <div className="h-8 bg-surface-container-lowest border-t border-outline-variant px-4 flex items-center text-on-surface-variant font-label-sm text-label-sm shrink-0 justify-between">
              <span>Python 3.10 environment (Sandboxed)</span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-outline-variant"></span> System Idle</span>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Native TTS Headless Player */}
      <NativeAudioPlayer 
        text={status === 'speaking' && hasInteracted ? currentQuestionText : ''}
        autoPlay={status === 'speaking' && hasInteracted}
        onEnded={handleAudioPlaybackEnded}
      />
    </div>
  );
};

export default LiveInterview;
