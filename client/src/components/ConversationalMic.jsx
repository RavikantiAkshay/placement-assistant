import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';

const ConversationalMic = ({ onAnswerSubmit, disabled }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);

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
      let currentTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      setTranscript(prev => prev + ' ' + currentTranscript);

      // Auto-submit after 3 seconds of silence
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => {
        if (isListening) stopListening();
      }, 3000);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, []);

  const startListening = () => {
    setTranscript('');
    setIsListening(true);
    recognitionRef.current?.start();
  };

  const stopListening = () => {
    setIsListening(false);
    recognitionRef.current?.stop();
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    
    // Slight delay to ensure final transcript is captured
    setTimeout(() => {
      if (transcript.trim()) {
        onAnswerSubmit(transcript.trim());
      }
    }, 500);
  };

  const toggleListen = () => {
    if (isListening) stopListening();
    else startListening();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={toggleListen}
        disabled={disabled}
        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
          disabled ? 'bg-gray-200 text-gray-400 cursor-not-allowed' :
          isListening ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-200' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
        }`}
      >
        {isListening ? <MicOff size={28} /> : <Mic size={28} />}
      </button>
      
      {isListening && (
        <div className="text-center">
          <p className="text-sm text-red-500 font-medium animate-pulse">Listening...</p>
          <p className="text-xs text-gray-500 mt-1">Auto-submits after 3s of silence</p>
        </div>
      )}

      {transcript && isListening && (
        <div className="w-full max-w-lg p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-700 italic">
          "{transcript}"
        </div>
      )}
    </div>
  );
};

export default ConversationalMic;
