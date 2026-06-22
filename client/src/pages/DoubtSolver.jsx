import React, { useState, useEffect, useRef } from 'react';
import { 
  getAllDoubts, getDoubtById, createDoubt, deleteDoubt, 
  askText, askImage, askVoice 
} from '../services/doubt.service';
import { Brain, Image as ImageIcon, Mic, Send, Plus, Trash2, ArrowLeft, Loader2, MessageSquare, Copy, Check, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Link } from 'react-router-dom';

const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const copyText = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start gap-4'} mb-6`}>
      {!isUser && (
        <div className="w-10 h-10 rounded-xl bg-[#00855b]/20 flex flex-shrink-0 items-center justify-center text-[#00855b] border border-[#00855b]/30">
          <Sparkles size={20} />
        </div>
      )}
      
      <div className={`max-w-[85%] md:max-w-[75%] flex flex-col ${isUser ? 'items-end' : 'items-start'} gap-2`}>
        {message.imageUrl && (
          <div className="bg-surface-container border border-outline-variant p-2 rounded-xl rounded-tr-sm shadow-sm overflow-hidden w-64 md:w-80">
            <img src={message.imageUrl} alt="Uploaded Problem" className="w-full h-auto rounded-lg" />
          </div>
        )}
        
        <div className={`px-5 py-4 rounded-2xl shadow-sm ${
          isUser 
            ? 'bg-[#00855b] text-white rounded-tr-sm font-medium' 
            : 'bg-surface border border-outline-variant/50 rounded-tl-sm text-on-surface'
        }`}>
          {isUser ? (
            <div className="whitespace-pre-wrap">{message.content}</div>
          ) : (
            <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({node, inline, className, children, ...props}) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        className="rounded-xl overflow-hidden my-4"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className="bg-surface-container-high px-1.5 py-0.5 rounded text-sm text-[#00855b]" {...props}>
                        {children}
                      </code>
                    )
                  }
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
        
        {!isUser && (
          <div className="flex gap-2">
            <button 
              onClick={copyText}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-variant text-on-surface-variant transition-colors" 
              title="Copy"
            >
              {copied ? <Check size={14} className="text-[#00855b]" /> : <Copy size={14} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default function DoubtSolver() {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  // Input state
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Audio state
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef(null);
  const audioChunksRef = useRef([]);
  
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  
  // Fetch initial chats
  useEffect(() => {
    fetchChats();
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages, isTyping]);

  const fetchChats = async () => {
    try {
      const data = await getAllDoubts();
      setChats(data);
      if (data.length > 0 && !activeChat) {
        openChat(data[0]._id);
      } else if (data.length === 0) {
        handleNewChat();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openChat = async (id) => {
    try {
      setLoading(true);
      const data = await getDoubtById(id);
      setActiveChat(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = async () => {
    try {
      setLoading(true);
      const newChat = await createDoubt();
      setChats([newChat, ...chats]);
      setActiveChat(newChat);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChat = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Delete this doubt chat?")) return;
    try {
      await deleteDoubt(id);
      setChats(chats.filter(c => c._id !== id));
      if (activeChat?._id === id) {
        if (chats.length > 1) {
          openChat(chats.find(c => c._id !== id)._id);
        } else {
          handleNewChat();
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        await handleSendVoice(audioBlob);
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    } catch (err) {
      console.error('Error accessing microphone', err);
      alert('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const handleSendVoice = async (audioBlob) => {
    if (!activeChat) return;
    try {
      setIsTyping(true);
      const tempUserMsg = { _id: Date.now(), role: 'user', content: '🎙️ Voice Message', inputMode: 'voice' };
      setActiveChat(prev => ({ ...prev, messages: [...prev.messages, tempUserMsg] }));
      
      const { userMessage, assistantMessage } = await askVoice(activeChat._id, audioBlob);
      
      setActiveChat(prev => ({
        ...prev,
        messages: prev.messages.filter(m => m._id !== tempUserMsg._id).concat([userMessage, assistantMessage])
      }));
      fetchChats(); // Refresh titles
    } catch (err) {
      console.error(err);
      setActiveChat(prev => ({ ...prev, messages: prev.messages.filter(m => m._id !== tempUserMsg._id) }));
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = async () => {
    if ((!text.trim() && !imageFile) || !activeChat || isTyping) return;

    const currentText = text;
    const currentImageFile = imageFile;
    const currentImagePreview = imagePreview;

    setText('');
    setImageFile(null);
    setImagePreview(null);

    setIsTyping(true);

    try {
      const tempUserMsg = { 
        _id: Date.now(), 
        role: 'user', 
        content: currentText || '📷 Image uploaded', 
        imageUrl: currentImagePreview 
      };
      setActiveChat(prev => ({ ...prev, messages: [...prev.messages, tempUserMsg] }));

      let response;
      if (currentImageFile) {
        response = await askImage(activeChat._id, currentImageFile, currentText);
      } else {
        response = await askText(activeChat._id, currentText);
      }

      setActiveChat(prev => ({
        ...prev,
        messages: prev.messages.filter(m => m._id !== tempUserMsg._id).concat([response.userMessage, response.assistantMessage])
      }));
      fetchChats(); // Refresh title
    } catch (err) {
      console.error(err);
      alert('Failed to send message');
      // Revert optimism on error is complex, just remove temp for now
      setActiveChat(prev => ({
        ...prev,
        messages: prev.messages.filter(m => m._id !== tempUserMsg._id)
      }));
    } finally {
      setIsTyping(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="flex h-[calc(100vh-80px)] w-full bg-surface-container-lowest max-w-[1600px] mx-auto overflow-hidden rounded-xl border border-outline-variant/30 my-6 shadow-sm">
      {/* Sidebar */}
      <aside className="w-80 bg-surface-container-low border-r border-outline-variant/30 hidden md:flex flex-col shrink-0 h-full">
        <div className="p-4 border-b border-outline-variant/30 flex items-center justify-between">
          <Link to="/dashboard" className="text-on-surface-variant hover:text-primary transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <button 
            onClick={handleNewChat}
            className="flex-1 ml-4 flex items-center justify-center gap-2 bg-[#00855b]/10 text-[#00855b] py-2 px-4 rounded-lg hover:bg-[#00855b]/20 transition-colors font-bold"
          >
            <Plus size={18} /> New Doubt
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {chats.map(chat => (
            <div 
              key={chat._id} 
              onClick={() => openChat(chat._id)}
              className={`flex justify-between items-center p-3 mb-1 rounded-lg cursor-pointer transition-colors group ${
                activeChat?._id === chat._id ? 'bg-[#00855b]/10 border-[#00855b]/30 border' : 'hover:bg-surface-variant border border-transparent'
              }`}
            >
              <div className="flex flex-col overflow-hidden">
                <span className={`font-bold text-sm truncate ${activeChat?._id === chat._id ? 'text-[#00855b]' : 'text-on-surface'}`}>
                  {chat.title}
                </span>
                <span className="text-xs text-on-surface-variant capitalize">{chat.subject}</span>
              </div>
              <button 
                onClick={(e) => handleDeleteChat(e, chat._id)}
                className="text-on-surface-variant hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full bg-surface-container-lowest relative">
        {/* Header */}
        <header className="h-16 border-b border-outline-variant/30 bg-surface/50 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00855b]/20 flex items-center justify-center text-[#00855b]">
              <Sparkles size={20} />
            </div>
            <div>
              <h1 className="font-bold text-on-surface">{activeChat ? activeChat.title : 'AI Doubt Solver'}</h1>
              <p className="text-xs text-on-surface-variant">{activeChat ? activeChat.subject : 'Start asking'}</p>
            </div>
          </div>
        </header>

        {/* Chat Canvas */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col scroll-smooth">
          {loading && !activeChat ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="animate-spin text-primary w-8 h-8" />
            </div>
          ) : activeChat?.messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 bg-[#00855b]/10 text-[#00855b] rounded-full flex items-center justify-center mb-6 border-4 border-[#00855b]/20">
                <Brain size={40} />
              </div>
              <h2 className="text-2xl font-bold text-on-surface mb-2">What do you want to learn?</h2>
              <p className="text-on-surface-variant max-w-md">
                Type an equation, snap a picture of a diagram, or record your voice. Your AI tutor is ready to explain.
              </p>
            </div>
          ) : (
            <div className="flex flex-col pb-4">
              {activeChat?.messages.map((msg, idx) => (
                <MessageBubble key={msg._id || idx} message={msg} />
              ))}
              
              {isTyping && (
                <div className="flex w-full gap-4 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#00855b]/20 flex flex-shrink-0 items-center justify-center text-[#00855b] border border-[#00855b]/30">
                    <Sparkles size={20} className="animate-pulse" />
                  </div>
                  <div className="bg-surface border border-outline-variant/50 px-5 py-4 rounded-2xl rounded-tl-sm flex items-center gap-2 text-on-surface-variant">
                    <span className="text-sm font-medium">Analyzing...</span>
                    <Loader2 size={16} className="animate-spin text-[#00855b]" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-surface border-t border-outline-variant/30 shrink-0">
          <div className="max-w-4xl mx-auto flex flex-col gap-3">
            {/* Image Preview */}
            {imagePreview && (
              <div className="relative inline-block self-start mb-2 group">
                <img src={imagePreview} alt="Preview" className="h-20 w-auto rounded-lg border-2 border-primary/50 object-cover shadow-sm" />
                <button 
                  onClick={() => { setImageFile(null); setImagePreview(null); }}
                  className="absolute -top-2 -right-2 bg-error text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )}

            {/* Input Container */}
            <div className="relative flex items-end bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-2 shadow-sm focus-within:border-[#00855b] focus-within:ring-1 focus-within:ring-[#00855b] transition-all">
              
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
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant text-on-surface-variant transition-colors group" 
                  title="Upload Image"
                >
                  <ImageIcon size={20} className="group-hover:text-primary" />
                </button>
                <button 
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
                    isRecording 
                      ? 'bg-error/20 text-error hover:bg-error/30' 
                      : 'hover:bg-surface-variant text-on-surface-variant hover:text-primary'
                  }`}
                  title="Voice Input"
                >
                  {isRecording ? <div className="w-3 h-3 bg-error rounded-sm animate-pulse" /> : <Mic size={20} />}
                </button>
              </div>

              {/* Text Area */}
              {isRecording ? (
                <div className="flex-1 flex items-center py-3 px-2 text-error font-medium">
                  Recording... {formatTime(recordingTime)}
                </div>
              ) : (
                <textarea 
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[44px] py-2 px-1 text-sm md:text-base text-on-surface placeholder:text-outline outline-none" 
                  placeholder="Type your doubt, upload an image, or use voice..." 
                  rows="1"
                />
              )}

              {/* Right Actions */}
              <div className="flex items-center gap-2 mb-1 ml-2">
                {!isRecording && (
                  <button 
                    onClick={handleSend}
                    disabled={(!text.trim() && !imageFile) || isTyping}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#00855b] text-white disabled:opacity-50 disabled:hover:scale-100 hover:bg-[#00855b]/90 shadow-sm transition-all transform hover:-translate-y-0.5" 
                  >
                    <Send size={18} className="ml-1" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="text-center text-[10px] text-outline-variant font-medium">
              AI can make mistakes. Always verify important calculations.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
