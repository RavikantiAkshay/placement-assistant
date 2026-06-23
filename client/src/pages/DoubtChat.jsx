import React, { useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MoreVertical, Plus } from 'lucide-react';
import { ChatContext } from '../context/ChatContext';
import MessageBubble from '../components/Doubt/MessageBubble';
import InputArea from '../components/Doubt/InputArea';

export default function DoubtChat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { activeChat, sendingMessage } = useContext(ChatContext);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Auto-scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages, sendingMessage]);

  if (!activeChat) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f9f9ff] text-gray-800 font-sans overflow-hidden">
      
      {/* Optional Sidebar (Hidden on small screens) */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-200">
          <button onClick={() => navigate('/dashboard')} className="mb-4 flex items-center text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
          </button>
          <button className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-sm">
            <Plus className="w-5 h-5" />
            New Doubt
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 py-2 mt-2">Today</div>
          <button className="w-full text-left flex flex-col bg-blue-50 border border-blue-100 rounded-xl p-3 mb-1">
            <span className="font-medium text-gray-900 truncate w-full">{activeChat.title}</span>
            <span className="text-xs text-gray-500 truncate w-full mt-1">Active session...</span>
          </button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full relative bg-[#fcfcff]">
        
        {/* Header */}
        <header className="h-16 border-b border-gray-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/dashboard')} 
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900 truncate max-w-[200px] md:max-w-md">{activeChat.title}</h1>
          </div>
          <div className="flex items-center">
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Chat Canvas */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 flex flex-col scroll-smooth">
          
          <div className="flex justify-center mb-4">
            <span className="bg-gray-100 text-gray-500 text-xs font-medium px-3 py-1 rounded-full border border-gray-200">
              Today
            </span>
          </div>

          {activeChat.messages.map((msg) => (
            <MessageBubble key={msg._id} message={msg} />
          ))}

          {sendingMessage && (
            <div className="flex w-full gap-4 mb-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex flex-shrink-0 items-center justify-center text-blue-600 mt-1">
                <div className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
              </div>
              <div className="max-w-[85%] md:max-w-[75%]">
                <div className="bg-white border border-gray-200 px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2 text-gray-500">
                  <span className="text-sm font-medium">Analyzing and thinking</span>
                  <div className="flex gap-1 ml-1">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} className="h-4" />
        </div>

        {/* Input Area */}
        <div className="w-full bg-gradient-to-t from-[#fcfcff] via-[#fcfcff] to-transparent pt-6 pb-4">
          <InputArea subject={activeChat.subject} disabled={sendingMessage} />
        </div>
      </main>
    </div>
  );
}
