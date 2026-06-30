import React, { useState, useRef, useContext, useEffect } from 'react';
import { Send, Image as ImageIcon, Mic, X, Loader2, ChevronDown } from 'lucide-react';
import { ChatContext } from '../../context/ChatContext';
import VoiceInput from './VoiceInput';
import toast from 'react-hot-toast';

const SUBJECTS = [
  'General', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 
  'Computer Science', 'Data Structures', 'Algorithms', 'Web Development'
];

export default function InputArea({ subject: initialSubject, disabled }) {
  const { askText, askImage, askVoice, activeChat } = useContext(ChatContext);
  
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [subject, setSubject] = useState(initialSubject || 'General');
  const [showSubjects, setShowSubjects] = useState(false);
  
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [text]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = () => {
    if (disabled) return;
    
    if (imageFile) {
      if (!text.trim()) {
        toast.error('Please add a question with your image');
        return;
      }
      askImage(activeChat?._id, imageFile, text, subject);
      removeImage();
      setText('');
    } else if (text.trim()) {
      askText(activeChat?._id, text, subject);
      setText('');
    }
  };

  const handleVoiceRecorded = (audioBlob) => {
    askVoice(activeChat?._id, audioBlob, subject);
    setIsVoiceMode(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isVoiceMode) {
    return (
      <div className="w-full max-w-4xl mx-auto mb-6 px-4">
        <VoiceInput 
          onRecorded={handleVoiceRecorded} 
          onCancel={() => setIsVoiceMode(false)}
          disabled={disabled}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto mb-6 px-4 relative z-20">
      
      {/* Subject Selector (above input) */}
      <div className="flex justify-end mb-2">
        <div className="relative">
          <button 
            onClick={() => setShowSubjects(!showSubjects)}
            className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 hover:bg-white text-xs px-3 py-1.5 rounded-full shadow-sm transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            {subject}
            <ChevronDown className="w-3 h-3" />
          </button>
          
          {showSubjects && (
            <div className="absolute bottom-full right-0 mb-2 w-48 bg-white border border-gray-200 shadow-xl rounded-xl py-1 z-50">
              {SUBJECTS.map(s => (
                <button
                  key={s}
                  onClick={() => { setSubject(s); setShowSubjects(false); }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${subject === s ? 'text-blue-600 bg-blue-50/50 font-medium' : 'text-gray-700'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={`relative flex flex-col bg-white border border-gray-300 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all ${disabled ? 'opacity-75 pointer-events-none' : ''}`}>
        
        {/* Image Preview Area */}
        {imagePreview && (
          <div className="p-3 border-b border-gray-100 flex items-start gap-3">
            <div className="relative group rounded-lg overflow-hidden border border-gray-200 w-24 h-24 flex-shrink-0 bg-gray-50">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <button 
                onClick={removeImage}
                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                aria-label="Remove Image"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <p className="text-sm font-medium text-gray-700 truncate">{imageFile.name}</p>
              <p className="text-xs text-gray-500">{(imageFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
        )}

        <div className="flex items-end p-2">
          {/* Left Actions */}
          <div className="flex gap-1 mb-1 mr-2">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleImageSelect}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
              title="Attach Image"
              aria-label="Attach Image"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setIsVoiceMode(true)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors"
              title="Voice Input"
              aria-label="Voice Input"
            >
              <Mic className="w-5 h-5" />
            </button>
          </div>

          {/* Text Area */}
          <textarea 
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none focus:ring-0 resize-none min-h-[44px] py-3 px-1 text-gray-800 placeholder-gray-400 outline-none text-[15px]"
            placeholder="Type your doubt or attach an image..."
            rows="1"
            disabled={disabled}
          />

          {/* Right Actions */}
          <div className="flex items-center mb-1 ml-2">
            <button 
              onClick={handleSend}
              disabled={disabled || (!text.trim() && !imageFile)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 shadow-sm transition-all transform hover:scale-105"
              aria-label="Send Message"
            >
              {disabled ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
      
      <div className="text-center text-xs text-gray-400 mt-2 font-medium">
        AI responses may not be perfectly accurate. Verify important information.
      </div>
    </div>
  );
}
