import React, { useEffect, useRef, useState } from 'react';

const NativeAudioPlayer = ({ text, onEnded, autoPlay }) => {
  const utteranceRef = useRef(null);
  const [voicesLoaded, setVoicesLoaded] = useState(false);

  // Ensure voices are loaded (some browsers load them asynchronously)
  useEffect(() => {
    const handleVoicesChanged = () => {
      setVoicesLoaded(true);
    };
    
    // Check if already loaded
    if (window.speechSynthesis.getVoices().length > 0) {
      setVoicesLoaded(true);
    }

    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
    };
  }, []);

  useEffect(() => {
    if (!text || !autoPlay) return;

    // Clean text to sound more conversational and less like "reading"
    const cleanText = text
      .replace(/[\*\#\_\[\]\`]/g, '') // Remove markdown formatting
      .replace(/https?:\/\/[^\s]+/g, 'a link') // Replace URLs
      .trim();

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    const voices = window.speechSynthesis.getVoices();
    
    // Priority: Premium Neural -> Google -> Microsoft default -> Apple -> Any female -> Any English
    let selectedVoice = voices.find(v => v.name.includes('Neural') && v.name.includes('Female') && v.lang.startsWith('en'));
    
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.name.includes('Google UK English Female') || v.name.includes('Google US English'));
    }
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.name.includes('Zira') || v.name.includes('Samantha') || v.name.includes('Victoria'));
    }
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Female'));
    }
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang.startsWith('en'));
    }
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    // Adjust rate and pitch to sound more conversational, less robotic
    utterance.rate = 0.95; 
    utterance.pitch = 1.05;

    utterance.onend = () => {
      if (onEnded) onEnded();
    };

    utterance.onerror = (e) => {
      console.error('Speech synthesis error:', e);
      if (onEnded) onEnded();
    };

    utteranceRef.current = utterance;
    
    // Small delay to ensure speech engine is ready
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 100);

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [text, autoPlay, voicesLoaded]);

  return null;
};

export default NativeAudioPlayer;
