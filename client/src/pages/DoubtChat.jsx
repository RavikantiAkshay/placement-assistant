import React, { useEffect, useRef, useContext, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MoreVertical, Plus, CheckCircle2, XCircle, Lightbulb, Zap, Menu, PanelLeft, Download } from 'lucide-react';
import { ChatContext } from '../context/ChatContext';
import MessageBubble from '../components/Doubt/MessageBubble';
import InputArea from '../components/Doubt/InputArea';

export default function DoubtChat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { chats, activeChat, sendingMessage, selectChat, createNewChat, askText, deleteChat } = useContext(ChatContext);
  const messagesEndRef = useRef(null);
  const [showSidebar, setShowSidebar] = useState(true);
  
  // Use a ref to strictly prevent double firing in React StrictMode
  const initialPromptSentRef = useRef(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleDownloadChat = () => {
    if (!activeChat) return;
    
    let mdContent = `# ${activeChat.title || 'Doubt Session'}\n\n`;
    (activeChat.messages || []).forEach(msg => {
      const roleName = msg.role === 'user' ? 'You' : 'Placement Assistant';
      mdContent += `**${roleName}**:\n${msg.content}\n\n`;
    });
    
    const blob = new Blob([mdContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeChat.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_thread.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowMenu(false);
  };

  useEffect(() => {
    if (id && id !== 'new') {
      selectChat(id);
    } else {
      createNewChat();
    }
  }, [id]);

  useEffect(() => {
    if (location.state?.initialPrompt && !initialPromptSentRef.current && id === 'new') {
      initialPromptSentRef.current = true;
      askText(null, location.state.initialPrompt, location.state.subject || 'Interview Feedback').then((newChatId) => {
        if (newChatId) {
           navigate(`/doubts/${newChatId}`, { replace: true });
        }
      });
      
      // Clean up location state so a refresh doesn't trigger it again
      const newState = { ...location.state };
      delete newState.initialPrompt;
      window.history.replaceState(newState, '');
    }
  }, [location.state, id, askText, navigate]);

  useEffect(() => {
    // Auto-scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages, sendingMessage]);

  if (!activeChat && id !== 'new') {
    return (
      <div className="flex h-screen bg-[#f9f9ff] overflow-hidden">
        {/* Skeleton Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col p-4 shrink-0">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-24 mb-6"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </aside>
        {/* Skeleton Main */}
        <main className="flex-1 flex flex-col p-8">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-48 mb-12"></div>
          <div className="space-y-6">
            <div className="w-3/4 h-24 bg-gray-200 rounded-2xl animate-pulse"></div>
            <div className="w-1/2 h-24 bg-blue-100 rounded-2xl animate-pulse self-end"></div>
            <div className="w-2/3 h-32 bg-gray-200 rounded-2xl animate-pulse"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f9f9ff] text-gray-800 font-sans overflow-hidden">
      
      {/* Optional Sidebar (Hidden on small screens, toggleable on md+) */}
      <aside className={`w-64 bg-white border-r border-gray-200 flex-col shrink-0 transition-all duration-300 ${showSidebar ? 'hidden md:flex' : 'hidden'}`}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <button onClick={() => navigate('/dashboard')} className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </button>
          <button 
            onClick={() => setShowSidebar(false)}
            className="flex items-center justify-center p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            title="Hide Sidebar"
            aria-label="Hide Sidebar"
          >
            <PanelLeft className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 py-2 mt-2 mb-2">Previous Doubts</div>
          
          {/* Active 'New' Session Placeholder */}
          {!activeChat && id === 'new' && (
            <button className="w-full text-left flex flex-col bg-blue-50 border border-blue-100 rounded-xl p-3 mb-1">
              <span className="font-medium text-gray-900 truncate w-full">New Session</span>
              <span className="text-xs text-gray-500 truncate w-full mt-1">Waiting for input...</span>
            </button>
          )}

          {/* List of Chats */}
          {(chats || []).map(chat => (
            <button 
              key={chat._id}
              onClick={() => navigate(`/doubts/${chat._id}`)}
              className={`w-full text-left flex flex-col rounded-xl p-3 mb-1 transition-colors ${activeChat?._id === chat._id ? 'bg-blue-50 border border-blue-100' : 'hover:bg-gray-50 border border-transparent'}`}
            >
              <span className="font-medium text-gray-900 truncate w-full">{chat.title}</span>
              <span className="text-xs text-gray-500 truncate w-full mt-1">{chat.subject}</span>
            </button>
          ))}
          
          {chats.length === 0 && id !== 'new' && (
            <div className="text-sm text-gray-400 text-center mt-4">No previous doubts</div>
          )}
        </div>
        
        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <button 
            onClick={() => {
              createNewChat();
              navigate('/doubts/new');
            }}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 px-4 rounded-xl hover:bg-blue-700 transition-colors font-bold shadow-sm text-sm">
            <Plus className="w-5 h-5" />
            New Doubt
          </button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full relative bg-[#fcfcff]">
        
        {/* Header */}
        <header className="h-16 border-b border-gray-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-4">
            {!showSidebar && (
              <button 
                onClick={() => setShowSidebar(true)} 
                className="hidden md:flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors border border-gray-200"
                title="Show Sidebar"
                aria-label="Show Sidebar"
              >
                <PanelLeft className="w-5 h-5 text-gray-500" />
              </button>
            )}
            <button 
              onClick={() => navigate('/dashboard')} 
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600"
              aria-label="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900 truncate max-w-[200px] md:max-w-md">{activeChat?.title || 'New Session'}</h1>
          </div>
          <div className="flex items-center relative">
            {activeChat && (
              <>
                <button 
                  onClick={() => setShowMenu(!showMenu)}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                  aria-label="Chat Options"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <button 
                      onClick={handleDownloadChat}
                      className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <Download size={16} /> Download Chat
                    </button>
                    <button 
                      onClick={() => {
                        setShowMenu(false);
                        if (window.confirm('Are you sure you want to delete this chat session?')) {
                          deleteChat(activeChat._id);
                          navigate('/doubts/new');
                        }
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <XCircle size={16} /> Delete Chat
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </header>

        {/* Chat Canvas */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 flex flex-col scroll-smooth">
          
          {activeChat ? (
            <>
              <div className="flex justify-center mb-4">
                <span className="bg-gray-100 text-gray-500 text-xs font-medium px-3 py-1 rounded-full border border-gray-200">
                  Today
                </span>
              </div>

              {(activeChat.messages || []).map((msg) => (
                <MessageBubble key={msg._id} message={msg} />
              ))}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-70">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
                <Plus className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Start a new Doubt Session</h2>
              <p className="text-gray-500 mt-2 max-w-md">Ask your math, physics, coding, or any general questions. You can attach images or use voice notes.</p>
            </div>
          )}

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
          <InputArea subject={activeChat?.subject} disabled={sendingMessage} />
        </div>
      </main>

      {/* Right Sidebar - Suggestions / Tips */}
      <aside className="w-[360px] bg-white border-l border-gray-200 hidden xl:flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-200 h-16 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <h2 className="font-semibold text-gray-800">Interaction Guidelines</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {/* Do / Don't Section */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Effective Queries</h3>
            <div className="space-y-4">
              
              {/* Tip 1 */}
              <div>
                <div className="bg-gray-50/80 border border-gray-200 p-3 rounded-t-xl border-b-0 shadow-sm">
                  <div className="flex items-center gap-2 text-gray-600 font-bold text-sm mb-1.5">
                    <XCircle className="w-4 h-4 text-gray-400" /> Just stating the error
                  </div>
                  <p className="text-[13px] text-gray-500 italic">"My code is broken and returning undefined."</p>
                </div>
                <div className="bg-blue-50/50 border border-blue-200 p-3 rounded-b-xl shadow-sm">
                  <div className="flex items-center gap-2 text-blue-700 font-bold text-sm mb-1.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" /> State the Goal
                  </div>
                  <p className="text-[13px] text-blue-800/80 font-medium leading-relaxed">"I'm trying to fetch user data on mount, but the array returns undefined. Here's my fetch function."</p>
                </div>
              </div>

              {/* Tip 2 */}
              <div>
                <div className="bg-gray-50/80 border border-gray-200 p-3 rounded-t-xl border-b-0 shadow-sm">
                  <div className="flex items-center gap-2 text-gray-600 font-bold text-sm mb-1.5">
                    <XCircle className="w-4 h-4 text-gray-400" /> Broad Requests
                  </div>
                  <p className="text-[13px] text-gray-500 italic">"Write a sorting function."</p>
                </div>
                <div className="bg-blue-50/50 border border-blue-200 p-3 rounded-b-xl shadow-sm">
                  <div className="flex items-center gap-2 text-blue-700 font-bold text-sm mb-1.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" /> Specify Constraints
                  </div>
                  <p className="text-[13px] text-blue-800/80 font-medium leading-relaxed">"Write a sorting function in Python with O(n log n) time complexity, without using built-in libraries."</p>
                </div>
              </div>

              {/* Tip 3 */}
              <div>
                <div className="bg-gray-50/80 border border-gray-200 p-3 rounded-t-xl border-b-0 shadow-sm">
                  <div className="flex items-center gap-2 text-gray-600 font-bold text-sm mb-1.5">
                    <XCircle className="w-4 h-4 text-gray-400" /> Generic Feedback
                  </div>
                  <p className="text-[13px] text-gray-500 italic">"Review this code."</p>
                </div>
                <div className="bg-blue-50/50 border border-blue-200 p-3 rounded-b-xl shadow-sm">
                  <div className="flex items-center gap-2 text-blue-700 font-bold text-sm mb-1.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" /> Assign a Persona
                  </div>
                  <p className="text-[13px] text-blue-800/80 font-medium leading-relaxed">"Act as a Senior React Engineer. Review this code for performance bottlenecks and suggest improvements."</p>
                </div>
              </div>
              
            </div>
          </div>

          {/* Quick Upload Tip */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-4.5 rounded-2xl shadow-sm p-4">
            <h4 className="font-bold text-blue-800 text-sm mb-2 flex items-center gap-2">
              📸 Vision Magic
            </h4>
            <p className="text-xs text-blue-700/80 leading-relaxed font-medium">
              Snap a photo of your textbook diagram or handwritten equations. The AI will read it instantly!
            </p>
          </div>
          
          {/* Examples */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Try These
            </h3>
            <div className="space-y-3">
              <div className="w-full text-left p-3.5 rounded-2xl bg-white border border-gray-200 text-[13px] text-gray-600 font-medium hover:border-gray-300 transition-colors shadow-sm cursor-default">
                "Explain QuickSort time complexity to me like I'm 10."
              </div>
              <div className="w-full text-left p-3.5 rounded-2xl bg-white border border-gray-200 text-[13px] text-gray-600 font-medium hover:border-gray-300 transition-colors shadow-sm cursor-default">
                "Help me balance this chemical equation step-by-step."
              </div>
            </div>
          </div>

        </div>
      </aside>
    </div>
  );
}
