import React, { useState } from 'react';
import { store } from '../../services/store';
import { X, Send, ShieldCheck, CheckCheck } from 'lucide-react';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose }) => {
  const provider = store.getSelectedProvider();
  const [messages, setMessages] = useState<{ sender: 'user' | 'provider'; text: string; time: string }[]>([
    {
      sender: 'provider',
      text: `Hello! Ramesh here. How can I help you with your electrical requirements today?`,
      time: '10:02 AM'
    }
  ]);
  const [input, setInput] = useState('');

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages((prev) => [
      ...prev,
      { sender: 'user', text: userMsg, time: '10:04 AM' }
    ]);
    setInput('');

    // Simulate provider instant response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'provider',
          text: `Got it. I can reach your location within 30 minutes with testing tools and replacement parts. You can confirm via the Book Service button.`,
          time: '10:04 AM'
        }
      ]);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none">
      <div className="bg-white rounded-3xl max-w-sm w-full h-[520px] flex flex-col shadow-2xl overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="bg-emerald-900 text-white p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src={provider.avatar}
              alt={provider.name}
              className="w-9 h-9 rounded-full object-cover border border-emerald-400"
            />
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1">
                <span>{provider.name}</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-[10px] text-emerald-200">Online • Typically replies in 2 mins</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message bubble stream */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-slate-50">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-emerald-700 text-white rounded-br-none shadow-xs'
                    : 'bg-white text-slate-800 rounded-bl-none border border-slate-200 shadow-2xs'
                }`}
              >
                {m.text}
              </div>
              <div className="flex items-center gap-1 text-[9px] text-slate-400 mt-0.5 px-1">
                <span>{m.time}</span>
                {m.sender === 'user' && <CheckCheck className="w-3 h-3 text-emerald-600" />}
              </div>
            </div>
          ))}
        </div>

        {/* Chat input */}
        <form onSubmit={handleSend} className="p-2.5 bg-white border-t border-slate-100 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 bg-slate-100 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
          <button
            type="submit"
            className="w-9 h-9 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center active:scale-95 transition-all shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
