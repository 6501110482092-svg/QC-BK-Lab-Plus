import React, { useState, useRef, useEffect } from 'react';
import { HeartPulse, Send, User, Sparkles, Loader2, Stethoscope, AlertCircle } from 'lucide-react';
import { askBloodTestAdvisor } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

export default function BloodTestAIPanel() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: 'สวัสดีครับ ผมคือผู้ช่วยวิเคราะห์ผลเลือด (Clinical AI) ยินดีให้คำปรึกษาในการแปลผลแล็บและแนะนำแนวทางดูแลตัวเองสำหรับคนไข้ครับ \n\nลองพิมพ์ค่าที่ต้องการปรึกษาได้เลยครับ เช่น "Glucose 150 mg/dL หมายความว่าอย่างไร?"' }
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

    const aiResponse = await askBloodTestAdvisor(userMessage);
    
    setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-[700px] bg-white rounded-3xl border border-rose-100 shadow-2xl shadow-rose-100/50 overflow-hidden relative">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-600 to-rose-500 p-6 text-white flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
            <Stethoscope size={24} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg leading-tight">ผู้ช่วยวิเคราะห์ผลเลือด & แนะนำคนไข้</h3>
            <p className="text-rose-100 text-[10px] uppercase font-black tracking-widest flex items-center">
              <Sparkles size={10} className="mr-1" /> Medical Clinical AI
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-rose-50/20">
        <div className="mb-4 bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-start space-x-2">
            <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-700 font-medium leading-relaxed">
              คำเตือน: ข้อมูลนี้เป็นการประมวลผลพื้นฐานโดย AI เพื่อช่วยบุคลากรทางการแพทย์ในการแปลผลเบื้องต้นเท่านั้น ไม่สามารถใช้แทนการวินิจฉัยโดยแพทย์ได้
            </p>
        </div>

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
                  m.role === 'user' ? 'bg-rose-600 text-white' : 'bg-white text-rose-600 border border-rose-100'
                }`}>
                  {m.role === 'user' ? <User size={16} /> : <HeartPulse size={16} />}
                </div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                  m.role === 'user' 
                    ? 'bg-rose-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-700 border border-rose-100 rounded-tl-none font-medium'
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
              <div className="w-8 h-8 rounded-lg bg-white border border-rose-100 flex items-center justify-center text-rose-600">
                <HeartPulse size={16} className="animate-spin" />
              </div>
              <div className="p-4 rounded-2xl bg-white border border-rose-100 rounded-tl-none flex items-center space-x-2">
                <Loader2 size={16} className="animate-spin text-rose-600" />
                <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">กำลังวิเคราะห์ข้อมูลทางการแพทย์...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-6 bg-white border-t border-rose-100 flex items-center space-x-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="พิมพ์รายการผลเลือดที่ต้องการปรึกษา..."
          className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 transition-all font-medium"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="w-12 h-12 bg-rose-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-rose-600/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}
