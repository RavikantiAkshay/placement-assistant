import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Brain, User, Image as ImageIcon, Mic, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const InputTypeBadge = ({ type }) => {
  const badges = {
    image: { icon: <ImageIcon className="w-3 h-3" />, label: 'Image', cls: 'bg-purple-100 text-purple-700' },
    voice: { icon: <Mic className="w-3 h-3" />, label: 'Voice', cls: 'bg-green-100 text-green-700' }
  };
  
  const config = badges[type];
  if (!config) return null;
  
  return (
    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mb-1 w-max ${config.cls}`}>
      {config.icon} {config.label}
    </span>
  );
};

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  if (isUser) {
    return (
      <div className="flex justify-end w-full mb-6">
        <div className="max-w-[85%] md:max-w-[70%] flex flex-col items-end gap-2">
          {message.inputMode !== 'text' && <InputTypeBadge type={message.inputMode} />}
          
          {message.imageUrl && (
            <div className="bg-surface-container border border-outline-variant p-2 rounded-xl shadow-sm overflow-hidden w-64 md:w-80">
              <img src={message.imageUrl} alt="User doubt" className="w-full h-auto rounded-lg" />
            </div>
          )}
          
          {message.audioUrl && (
            <div className="bg-surface-container border border-outline-variant p-3 rounded-xl shadow-sm w-64 md:w-80">
              <audio src={message.audioUrl} controls className="w-full h-8" />
            </div>
          )}
          
          <div className="bg-blue-600 text-white px-4 py-3 rounded-2xl rounded-tr-sm shadow-sm font-body-md text-body-md">
            {message.content}
          </div>
        </div>
      </div>
    );
  }

  // Assistant Message
  return (
    <div className="flex w-full gap-4 mb-6">
      <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex flex-shrink-0 items-center justify-center text-primary mt-1">
        <Brain className="w-5 h-5" />
      </div>
      <div className="max-w-[85%] md:max-w-[80%]">
        <div className="bg-white border border-gray-200 px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm font-body-md text-gray-800 markdown-content overflow-x-auto">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={oneDark}
                    language={match[1]}
                    PreTag="div"
                    className="rounded-lg my-2"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className="bg-gray-100 text-pink-600 px-1 py-0.5 rounded text-sm" {...props}>
                    {children}
                  </code>
                );
              },
              h1: ({children}) => <h1 className="text-2xl font-bold mb-4 text-gray-900">{children}</h1>,
              h2: ({children}) => <h2 className="text-xl font-bold mb-3 mt-6 text-gray-800 border-b pb-2">{children}</h2>,
              h3: ({children}) => <h3 className="text-lg font-semibold mb-2 mt-4 text-gray-800">{children}</h3>,
              p: ({children}) => <p className="mb-4 leading-relaxed">{children}</p>,
              ul: ({children}) => <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>,
              ol: ({children}) => <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>,
              li: ({children}) => <li className="text-gray-700">{children}</li>,
              blockquote: ({children}) => <blockquote className="border-l-4 border-primary/40 pl-4 py-1 italic bg-primary/5 rounded-r my-4">{children}</blockquote>,
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
        <div className="flex gap-2 mt-2">
          <button 
            onClick={handleCopy}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
            title="Copy response"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
