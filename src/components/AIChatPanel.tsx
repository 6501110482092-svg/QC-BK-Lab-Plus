import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, Loader2 } from 'lucide-react';
import { QCResult, QCConfig, Instrument } from '../types';
import { askQCExpert } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

interface AIChatPanelProps {
  results: QCResult[];
  configs: QCConfig[];
  instruments: Instrument[];
}

export default function AIChatPanel({ results, configs, instruments }: AIChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: 'สวัสดีครับ ผมคือ BK Lab AI Advisor ยินดีให้คำแนะนำเกี่ยวกับระบบ QC และกฎ Westgard ครับ' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    const aiResponse = await askQCExpert(userMessage, { results, configs, instruments });
    setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
      <div className="bg-[#0F4C81] p-6 text-white flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Bot size={24} />
          <div>
            <h3 className="font-bold text-lg">BK Lab AI Advisor</h3>
            <p className="text-blue-100 text-[10px] uppercase font-black tracking-widest flex items-center">
              <Sparkles size={10} className="mr-1" /> Powered by Gemini
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
        <AnimatePresence initial={false}>
          {messages.map((m, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`p-4 rounded-2xl text-sm max-w-[85%] ${
                m.role === 'user' ? 'bg-[#0F4C81] text-white rounded-tr-none' : 'bg-white border border-slate-100 rounded-tl-none'
              }`}>
                {m.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && <div className="text-xs text-slate-400 font-bold uppercase tracking-widest animate-pulse">AI กำลังวิเคราะห์...</div>}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-6 bg-white border-t border-slate-100 flex items-center space-x-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="ถาม AI เกี่ยวกับ QC หรือ Westgard Rules..."
          className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20 transition-all"
        />
        <button type="submit" disabled={!input.trim() || isLoading} className="w-12 h-12 bg-[#0F4C81] text-white rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}
