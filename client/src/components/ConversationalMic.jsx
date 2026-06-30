import React, { useState, useEffect, useRef } from 'react';

const ConversationalMic = ({ onAnswerSubmit, disabled, status, onTranscriptChange, onInterrupt }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [volume, setVolume] = useState(0);
  
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const finalTranscriptRef = useRef('');
  const isListeningRef = useRef(false);
  
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  const initRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech Recognition API not supported in this browser.');
      return null;
    }

    const recognition = new SpeechRecognition();
    // CRITICAL FIX: continuous = false forces Chrome to cleanly finalize text every time 
    // the user pauses for breath. This prevents Chrome's buffer from growing too large and 
    // completely freezing after 100 words. We simply restart the mic instantly in onend!
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let newFinalChunk = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          newFinalChunk += event.results[i][0].transcript + ' ';
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (newFinalChunk) {
        finalTranscriptRef.current += newFinalChunk;
      }

      const combined = finalTranscriptRef.current + interimTranscript;
      setTranscript(combined);
      
      if (onTranscriptChange) {
        onTranscriptChange(combined);
      }
    };

    recognition.onerror = (event) => {
      // no-speech just means they were quiet, which is fine.
      if (event.error !== 'no-speech') {
        console.error('Speech recognition error:', event.error);
      }
    };

    recognition.onend = () => {
      // Because continuous=false, this fires cleanly after every sentence/pause.
      // We instantly spin up a fresh instance to keep listening!
      if (isListeningRef.current) {
        setTimeout(() => {
          if (isListeningRef.current) {
            recognitionRef.current = initRecognition();
            try {
              recognitionRef.current?.start();
            } catch (e) {
              console.warn("Could not restart mic chunk:", e);
            }
          }
        }, 50); // 50ms instant restart
      }
    };

    return recognition;
  };

  useEffect(() => {
    return () => {
      isListeningRef.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      }
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  const startListening = async () => {
    finalTranscriptRef.current = '';
    setTranscript('');
    isListeningRef.current = true;
    setIsListening(true);
    audioChunksRef.current = [];
    
    if (onTranscriptChange) onTranscriptChange('');
    
    if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorderRef.current.start();
      
      // Audio Visualizer
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
        setVolume(sum / bufferLength);
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();
      
    } catch (err) {
      console.error("Microphone access denied for recording:", err);
    }

    recognitionRef.current = initRecognition();
    try {
      recognitionRef.current?.start();
    } catch(e) {
      console.error("Start failed:", e);
    }
  };

  const stopListening = () => {
    isListeningRef.current = false;
    setIsListening(false);
    
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
    }
    
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    setVolume(0);

    let audioBlob = null;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = () => {
        audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
        
        setTranscript((currentVal) => {
          const finalAnswer = currentVal.trim();
          onAnswerSubmit(finalAnswer, audioBlob);
          return currentVal;
        });
      };
      mediaRecorderRef.current.stop();
    } else {
      setTimeout(() => {
        setTranscript((currentVal) => {
          const finalAnswer = currentVal.trim();
          if (finalAnswer) {
            onAnswerSubmit(finalAnswer, null);
          }
          return currentVal;
        });
      }, 100);
    }
    
    if (onTranscriptChange) onTranscriptChange('');
  };

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
        
        <div className="relative flex items-center justify-center">
          {isListening && (
            <>
              <div 
                className="absolute inset-[-10px] bg-error/10 rounded-full transition-transform pointer-events-none"
                style={{ transform: `scale(${1 + (volume / 30)})`, transitionDuration: '50ms' }}
              ></div>
              <div 
                className="absolute inset-[-20px] border border-error/20 rounded-full transition-transform pointer-events-none"
                style={{ transform: `scale(${1 + (volume / 20)})`, transitionDuration: '50ms' }}
              ></div>
            </>
          )}
          <button 
            onClick={toggleListen}
            disabled={disabled}
            className={`relative z-10 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors group ${
              disabled ? 'bg-surface-container text-on-surface-variant cursor-not-allowed border border-outline-variant' :
              isListening ? 'bg-error text-on-error hover:bg-error-container hover:text-error ripple-container' : 
              'bg-primary text-on-primary hover:bg-surface-tint'
            }`}
          >
            <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>
              {isListening ? 'mic_off' : 'mic'}
            </span>
          </button>
        </div>
        
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
