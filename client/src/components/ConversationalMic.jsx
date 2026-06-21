import React, { useState, useEffect, useRef } from 'react';

const ConversationalMic = ({ onAnswerSubmit, disabled, status, onTranscriptChange, onInterrupt }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);

  const finalTranscriptRef = useRef('');
  const currentTranscriptRef = useRef('');
  const stopListeningRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech Recognition API not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += event.results[i][0].transcript + ' ';
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      
      const newTranscript = finalTranscriptRef.current + interimTranscript;
      setTranscript(newTranscript);
      currentTranscriptRef.current = newTranscript;
      
      if (onTranscriptChange) {
        onTranscriptChange(newTranscript);
      }

      // Auto-submit after 3 seconds of silence
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => {
        if (stopListeningRef.current) {
           stopListeningRef.current();
        }
      }, 3000);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      if (stopListeningRef.current) stopListeningRef.current(true); 
    };

    recognition.onend = () => {
      if (stopListeningRef.current) {
        stopListeningRef.current();
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, []);

  const startListening = () => {
    finalTranscriptRef.current = '';
    currentTranscriptRef.current = '';
    setTranscript('');
    setIsListening(true);
    if (onTranscriptChange) onTranscriptChange('');
    recognitionRef.current?.start();
  };

  const stopListening = () => {
    setIsListening(false);
    recognitionRef.current?.stop();
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    
    setTimeout(() => {
      const finalAnswer = currentTranscriptRef.current.trim();
      if (finalAnswer) {
        onAnswerSubmit(finalAnswer);
      }
      if (onTranscriptChange) onTranscriptChange('');
    }, 500);
  };

  useEffect(() => {
    stopListeningRef.current = stopListening;
  });

  const toggleListen = () => {
    if (isListening) stopListening();
    else startListening();
  };

  return (
    <div className="bg-surface border border-outline-variant rounded-xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)] shrink-0 flex flex-col items-center justify-center gap-2 relative overflow-hidden">
      {isListening && (
        <div className="absolute inset-0 bg-gradient-to-t from-primary-container/10 to-transparent opacity-50"></div>
      )}
      
      <p className={`font-label-md text-label-md relative z-10 ${isListening ? 'text-primary animate-pulse' : 'text-on-surface-variant'}`}>
        {isListening ? 'Agent is listening...' : (status === 'thinking' ? 'Agent is analyzing...' : (status === 'speaking' ? 'Agent is speaking...' : 'Ready to listen'))}
      </p>

      <div className="flex items-center gap-4 relative z-10 mt-1">
        <button 
          onClick={onInterrupt}
          disabled={status !== 'speaking'}
          className={`px-3 py-1.5 rounded text-on-surface-variant font-label-sm text-label-sm transition-colors flex items-center gap-1.5 border border-transparent ${status === 'speaking' ? 'hover:bg-surface-container hover:border-outline-variant text-error' : 'opacity-50 cursor-not-allowed'}`}
        >
          <span className="material-symbols-outlined text-[18px]">stop_circle</span>
          Stop AI
        </button>
        
        <button 
          onClick={toggleListen}
          disabled={disabled}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors group ${
            disabled ? 'bg-surface-container text-on-surface-variant cursor-not-allowed border border-outline-variant' :
            isListening ? 'bg-error text-on-error hover:bg-error-container hover:text-error ripple-container' : 
            'bg-primary text-on-primary hover:bg-surface-tint'
          }`}
        >
          <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>
            {isListening ? 'mic_off' : 'mic'}
          </span>
        </button>
        
        <button 
          onClick={stopListening}
          disabled={!isListening}
          className={`px-3 py-1.5 rounded border font-label-sm text-label-sm transition-colors flex items-center gap-1.5 ${
            !isListening ? 'border-outline-variant text-on-surface-variant opacity-50 cursor-not-allowed' : 'border-error text-error hover:bg-error-container'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">stop</span>
          Submit
        </button>
      </div>
    </div>
  );
};

export default ConversationalMic;
