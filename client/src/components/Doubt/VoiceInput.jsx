import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, X, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function VoiceInput({ onRecorded, onCancel, disabled }) {
  const [status, setStatus] = useState('idle'); // 'idle' | 'recording' | 'stopped'
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      stopRecording();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        chunksRef.current = [];
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setStatus('recording');
      
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      toast.error('Could not access microphone');
      console.error(err);
      onCancel();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && status === 'recording') {
      mediaRecorderRef.current.stop();
      setStatus('stopped');
      clearInterval(timerRef.current);
    }
  };

  const handleSend = () => {
    if (audioBlob) {
      onRecorded(audioBlob);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center bg-surface-container border border-outline-variant rounded-2xl p-4 w-full shadow-sm">
      <div className="flex items-center justify-between w-full mb-4">
        <span className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2">
          {status === 'recording' && <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>}
          {status === 'recording' ? 'Recording Doubt...' : status === 'stopped' ? 'Recording Ready' : 'Ready to Record'}
        </span>
        <button onClick={onCancel} className="text-outline hover:text-on-surface transition-colors" aria-label="Cancel">
          <X className="w-5 h-5" />
        </button>
      </div>

      {status === 'idle' && (
        <button 
          onClick={startRecording}
          disabled={disabled}
          className="w-16 h-16 rounded-full bg-primary text-on-primary flex items-center justify-center hover:bg-primary-container hover:text-on-primary-container transition-transform hover:scale-105"
          aria-label="Start Recording"
        >
          <Mic className="w-8 h-8" />
        </button>
      )}

      {status === 'recording' && (
        <div className="flex items-center gap-4">
          <div className="font-headline-md text-headline-md font-mono text-primary">
            {formatTime(duration)}
          </div>
          <button 
            onClick={stopRecording}
            className="w-12 h-12 rounded-full bg-error text-on-error flex items-center justify-center hover:opacity-90 transition-all"
            aria-label="Stop Recording"
          >
            <Square className="w-5 h-5" fill="currentColor" />
          </button>
        </div>
      )}

      {status === 'stopped' && (
        <div className="flex flex-col items-center w-full gap-4">
          <audio src={audioUrl} controls className="w-full h-10" />
          <div className="flex gap-2">
            <button 
              onClick={() => {
                setDuration(0);
                setAudioUrl(null);
                setAudioBlob(null);
                startRecording();
              }}
              className="px-4 py-2 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-variant transition-colors text-label-md font-label-md"
            >
              Retake
            </button>
            <button 
              onClick={handleSend}
              disabled={disabled}
              className="px-6 py-2 rounded-lg bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container transition-colors flex items-center gap-2 text-label-md font-label-md"
            >
              {disabled ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send Audio
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
