import React, { useEffect, useRef } from 'react';

const NativeAudioPlayer = ({ text, onEnded, autoPlay }) => {
  const utteranceRef = useRef(null);

  useEffect(() => {
    if (!text || !autoPlay) return;

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Try to find a good female English voice
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(v => 
      v.lang.startsWith('en') && (v.name.includes('Female') || v.name.includes('Google US English') || v.name.includes('Samantha'))
    );
    
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }
    
    utterance.rate = 1.0;
    utterance.pitch = 1.1;

    utterance.onend = () => {
      if (onEnded) onEnded();
    };

    utterance.onerror = (e) => {
      console.error('Speech synthesis error:', e);
      if (onEnded) onEnded();
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [text, autoPlay]);

  return null; // Headless component
};

export default NativeAudioPlayer;
