
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { BotIcon, UserIcon, SendIcon } from './Icons';

interface AgentPanelProps {
  chatHistory: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const AgentPanel: React.FC<AgentPanelProps> = ({ chatHistory, onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [chatHistory, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-lg">
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BotIcon className="text-cyan-400"/>
            Commerce Agent
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'agent' && <div className="w-8 h-8 flex-shrink-0 bg-slate-700 rounded-full flex items-center justify-center"><BotIcon className="w-5 h-5 text-cyan-400" /></div>}
            <div className={`max-w-md rounded-lg px-4 py-2 ${msg.sender === 'user' ? 'bg-violet-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
             {msg.sender === 'user' && <div className="w-8 h-8 flex-shrink-0 bg-slate-700 rounded-full flex items-center justify-center"><UserIcon className="w-5 h-5 text-slate-300" /></div>}
          </div>
        ))}
        {isLoading && (
            <div className="flex items-start gap-3 justify-start">
                <div className="w-8 h-8 flex-shrink-0 bg-slate-700 rounded-full flex items-center justify-center"><BotIcon className="w-5 h-5 text-cyan-400" /></div>
                <div className="max-w-sm rounded-lg px-4 py-3 bg-slate-700 text-slate-200 rounded-bl-none flex items-center space-x-2">
                    <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-0"></span>
                    <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-200"></span>
                    <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-400"></span>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-slate-700">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me to find a product..."
            disabled={isLoading}
            className="w-full bg-slate-800 border border-slate-600 rounded-full py-2 pl-4 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-white hover:bg-cyan-400 disabled:bg-slate-600 transition-colors"
          >
            <SendIcon className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AgentPanel;
