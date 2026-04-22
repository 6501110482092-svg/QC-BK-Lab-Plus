import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, Loader2, MessageSquare } from 'lucide-react';
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
    { role: 'ai', text: 'สวัสดีครับ ผมคือ BK Lab AI Advisor ผู้เชี่ยวชาญด้านระบบ QC Lab มีอะไรให้ผมช่วยวิเคราะห์ข้อมูลหรืออธิบายกฎ Westgard ไหมครับ?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
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
    <div className="flex flex-col h-[600px] bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden relative">
      {/* Header */}
      <div className="bg-[#0F4C81] p-6 text-white flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
            <Bot size={24} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg leading-tight">BK Lab AI Advisor</h3>
            <p className="text-blue-100 text-[10px] uppercase font-black tracking-widest flex items-center">
              <Sparkles size={10} className="mr-1" /> Powered by Gemini
            </p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
        <AnimatePresence initial={false}>
          {messages.map((m, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-[85%] space-x-3 ${m.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${
                  m.role === 'user' ? 'bg-[#0F4C81] text-white' : 'bg-white text-[#0F4C81] border border-slate-100'
                }`}>
                  {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  m.role === 'user' 
                    ? 'bg-[#0F4C81] text-white rounded-tr-none' 
                    : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none font-medium'
                }`}>
                  {m.text}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex space-x-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-[#0F4C81]">
                <Bot size={16} className="animate-spin" />
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-100 rounded-tl-none flex items-center space-x-2">
                <Loader2 size={16} className="animate-spin text-[#0F4C81]" />
                <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">AI กำลังวิเคราะห์...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-6 bg-white border-t border-slate-100 flex items-center space-x-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="พิมพ์คำถามเกี่ยวกับ QC หรือ Westgard Rules..."
          className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20 transition-all font-medium"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="w-12 h-12 bg-[#0F4C81] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-[#0F4C81]/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}
