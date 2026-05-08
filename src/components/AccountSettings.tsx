import React, { useState } from 'react';
import { Key, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { User } from '../types';

interface AccountSettingsProps {
  user: User;
  onUpdatePassword: (currentPass: string, newPass: string) => boolean;
}

export default function AccountSettings({ user, onUpdatePassword }: AccountSettingsProps) {
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPass !== confirmPass) {
      setError('รหัสผ่านใหม่ไม่ตรงกัน');
      return;
    }

    if (newPass.length < 4) {
      setError('รหัสผ่านต้องมีความยาวอย่างน้อย 4 ตัวอักษร');
      return;
    }

    const ok = onUpdatePassword(currentPass, newPass);
    if (ok) {
      setSuccess('เปลี่ยนรหัสผ่านสำเร็จแล้ว');
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
    } else {
      setError('รหัสผ่านปัจจุบันไม่ถูกต้อง');
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-3 bg-blue-50 text-[#0F4C81] rounded-2xl">
          <Key size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">ตั้งค่าบัญชีและรหัสผ่าน</h2>
          <p className="text-xs text-slate-500 font-medium tracking-wide italic">Account & Password Settings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* User Info Card */}
        <div className="space-y-6">
          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-[#0F4C81] text-white flex items-center justify-center font-black text-2xl shadow-lg border-4 border-white">
              {user.name[0]}
            </div>
            <div>
              <p className="font-black text-xl text-slate-800">{user.name}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded text-[10px] font-black uppercase tracking-widest leading-none">
                  {user.role}
                </span>
                <span className="text-xs font-bold text-slate-400">ID: {user.licenseNumber}</span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-blue-50/30 rounded-3xl border border-blue-100 flex items-start space-x-3">
            <AlertCircle size={18} className="text-[#0F4C81] mt-0.5 shrink-0" />
            <div className="text-sm text-slate-600 leading-relaxed">
              <p className="font-bold text-[#0F4C81] mb-1">ข้อแนะนำความปลอดภัย</p>
              <p>กรุณาใช้รหัสผ่านที่จดจำได้ง่ายสำหรับตัวท่านเอง แต่อยากต่อการคาดเดาโดยผู้อื่น และไม่ควรเปิดเผยรหัสผ่านให้ผู้อื่นทราบ</p>
            </div>
          </div>
        </div>

        {/* Password Form */}
        <div className="bg-white rounded-2xl">
          <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest mb-6 flex items-center">
            <Key size={16} className="mr-2 text-blue-600" />
            เปลี่ยนรหัสผ่านใหม่
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">รหัสผ่านปัจจุบัน</label>
              <input
                type="password"
                required
                placeholder="ระบุรหัสผ่านปัจจุบัน"
                value={currentPass}
                onChange={e => setCurrentPass(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-[#0F4C81]/10 outline-none transition-all placeholder:text-slate-300"
              />
            </div>

            <div className="h-px bg-slate-100 my-2"></div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">รหัสผ่านใหม่</label>
              <input
                type="password"
                required
                placeholder="ระบุรหัสผ่านใหม่ที่ต้องการ"
                value={newPass}
                onChange={e => setNewPass(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-[#0F4C81]/10 outline-none transition-all placeholder:text-slate-300"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">ยืนยันรหัสผ่านใหม่</label>
              <input
                type="password"
                required
                placeholder="พิมพ์รหัสผ่านใหม่อีกครั้ง"
                value={confirmPass}
                onChange={e => setConfirmPass(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-[#0F4C81]/10 outline-none transition-all placeholder:text-slate-300"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold flex items-center space-x-2 animate-in slide-in-from-top-1">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold flex items-center space-x-2 animate-in slide-in-from-top-1">
                <CheckCircle2 size={14} />
                <span>{success}</span>
              </div>
            )}

            <button 
              type="submit" 
              className="w-full py-4 bg-[#0F4C81] text-white rounded-xl font-bold shadow-lg shadow-[#0F4C81]/20 hover:bg-[#155e9c] active:scale-[0.98] transition-all flex items-center justify-center space-x-2 mt-4"
            >
              <Save size={18} />
              <span>อัปเดตรหัสผ่านใหม่</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
