import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User as UserType } from '../types';
import { Lock, User, SquareUser, ClipboardCheck, ArrowRight } from 'lucide-react';

interface AuthProps {
  onLogin: (license: string, password: string) => void;
  error?: string;
}

export default function Auth({ onLogin, error }: AuthProps) {
  const [license, setLicense] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(license, password);
  };

  return (
    <div className="min-h-screen bg-[#0F4C81] flex items-center justify-center p-4">
      {/* Background patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-400 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-indigo-400 rounded-full blur-[120px]"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10"
      >
        <div className="bg-slate-50 p-10 border-b border-slate-100 text-center">
          <div className="w-16 h-16 bg-[#0F4C81] rounded-2xl mx-auto flex items-center justify-center text-white mb-4 shadow-lg shadow-[#0F4C81]/20">
            <ClipboardCheck size={32} />
          </div>
          <h1 className="text-2xl font-black text-[#0F4C81] tracking-tight">QC BK Lab Plus⁺</h1>
          <p className="text-slate-400 text-sm font-medium mt-1">Authorized Access Only</p>
          <p className="text-[10px] text-slate-300 mt-2 font-bold uppercase tracking-wider">Default Admin: <span className="text-[#0F4C81]">ADMIN</span> / Pass: <span className="text-[#0F4C81]">admin</span></p>
        </div>

        <div className="p-10">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <SquareUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                required
                value={license}
                onChange={(e) => setLicense(e.target.value)}
                placeholder="License Number"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20 transition-all font-medium"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20 transition-all font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#0F4C81] text-white font-bold py-4 rounded-xl hover:bg-[#0b3a63] transition-all shadow-lg shadow-[#0F4C81]/20 flex items-center justify-center group"
            >
              <span>Verify Integrity</span>
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-50">
             <p className="text-center text-slate-300 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
              Contact Administrator to register account<br/>
              &copy; 2024 BK Lab Diagnostics
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
