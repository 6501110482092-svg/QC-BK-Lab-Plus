import React, { useState } from 'react';
import { UserPlus, ShieldCheck, Mail, Key, Trash2, Users } from 'lucide-react';
import { User } from '../types';

interface AdminPanelProps {
  users: User[];
  onAddUser: (u: User) => void;
  onDeleteUser: (id: string) => void;
}

export default function AdminPanel({ users, onAddUser, onDeleteUser }: AdminPanelProps) {
  const [newUser, setNewUser] = useState({ name: '', license: '', password: '', role: 'MT' as 'MT' | 'MD' });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const user: User = {
      id: `u-${Date.now()}`,
      name: newUser.name,
      licenseNumber: newUser.license,
      password: newUser.password,
      role: newUser.role,
    };
    onAddUser(user);
    setNewUser({ name: '', license: '', password: '', role: 'MT' });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">ระบบจัดการและบันทึกรายชื่อพนักงาน</h2>
            <p className="text-xs text-slate-500 font-medium tracking-wide italic">Lab Staff Management System</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden ring-1 ring-slate-100">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <UserPlus size={80} />
            </div>
            <h3 className="font-bold text-slate-800 mb-6 flex items-center space-x-2">
              <UserPlus size={18} className="text-[#0F4C81]" />
              <span>เพิ่มพนักงานใหม่</span>
            </h3>
            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">ชื่อ-นามสกุล</label>
                <div className="relative group">
                  <input
                    required
                    placeholder="ระบุชื่อจริง-นามสกุล"
                    value={newUser.name}
                    onChange={e => setNewUser({...newUser, name: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#0F4C81]/10 outline-none transition-all placeholder:text-slate-300 placeholder:font-normal"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">เลขที่ใบประกอบวิชาชีพ / ID</label>
                <div className="relative">
                  <input
                    required
                    placeholder="เช่น ว.12345"
                    value={newUser.license}
                    onChange={e => setNewUser({...newUser, license: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono focus:ring-2 focus:ring-[#0F4C81]/10 outline-none transition-all placeholder:text-slate-300 placeholder:font-normal"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">รหัสผ่าน (สำหรับ Login)</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="รหัสผ่านเข้าใช้งาน"
                    value={newUser.password}
                    onChange={e => setNewUser({...newUser, password: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#0F4C81]/10 outline-none transition-all placeholder:text-slate-300 placeholder:font-normal"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">ตำแหน่งงาน</label>
                <select
                  value={newUser.role}
                  onChange={e => setNewUser({...newUser, role: e.target.value as any})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-[#0F4C81] outline-none cursor-pointer appearance-none"
                >
                  <option value="MT">นักเทคนิคการแพทย์ (MT)</option>
                  <option value="MD">พยาธิแพทย์ (MD)</option>
                </select>
              </div>
              <button type="submit" className="w-full py-4 bg-[#0F4C81] text-white rounded-xl font-bold shadow-lg shadow-[#0F4C81]/20 hover:bg-[#155e9c] active:scale-[0.98] transition-all flex items-center justify-center space-x-2">
                <UserPlus size={18} />
                <span>บันทึกรายชื่อพนักงาน</span>
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden ring-1 ring-slate-100">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <h3 className="font-bold text-slate-800">รายชื่อพนักงานที่มีสิทธิ์ใช้งาน</h3>
              <span className="bg-slate-200 text-slate-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">{users.length} พนักงาน</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-tighter">
                  <tr>
                    <th className="px-8 py-5">ข้อมูลพนักงาน</th>
                    <th className="px-8 py-5">รหัสใบประกอบ/ID</th>
                    <th className="px-8 py-5">สถานะ</th>
                    <th className="px-8 py-5 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map(u => (
                    <tr key={u.id} className="group hover:bg-slate-50/50 transition-all">
                      <td className="px-8 py-5">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-lg shadow-sm border border-indigo-100 group-hover:bg-[#0F4C81] group-hover:text-white transition-colors">
                            {u.name[0]}
                          </div>
                          <div>
                            <p className="font-black text-slate-700 text-sm">{u.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold opacity-80 uppercase tracking-widest">{u.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 font-mono text-xs text-slate-500 font-bold">
                        {u.licenseNumber}
                      </td>
                      <td className="px-8 py-5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black bg-emerald-50 text-emerald-600 uppercase tracking-widest ring-1 ring-emerald-100">
                          Active
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button
                          onClick={() => {
                            if(window.confirm(`ยืนยันการลบทิ้งรายชื่อพนักงาน ${u.name}?`)) {
                              onDeleteUser(u.id);
                            }
                          }}
                          className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          title="ลบรายชื่อ"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center justify-center space-y-3">
                           <Users size={48} className="text-slate-100" />
                           <p className="text-slate-300 italic font-medium">ยังไม่มีรายชื่อพนักงานในระบบ</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
