import React, { useState } from 'react';
import { UserPlus, ShieldCheck, Mail, Key, Trash2 } from 'lucide-react';
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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Access Control Center</h2>
            <p className="text-xs text-slate-500 font-medium">Manage and authorize laboratory personnel</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <UserPlus size={80} />
            </div>
            <h3 className="font-bold text-slate-800 mb-6 flex items-center space-x-2">
              <UserPlus size={18} className="text-[#0F4C81]" />
              <span>Provision New User</span>
            </h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 italic text-xs">Name</span>
                  <input
                    required
                    value={newUser.name}
                    onChange={e => setNewUser({...newUser, name: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-14 pr-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[#0F4C81]/10 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">License ID</label>
                <div className="relative">
                   <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 italic text-xs">ID</span>
                  <input
                    required
                    value={newUser.license}
                    onChange={e => setNewUser({...newUser, license: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-mono focus:ring-2 focus:ring-[#0F4C81]/10 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Password</label>
                <div className="relative">
                   <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 italic text-xs">PW</span>
                  <input
                    type="password"
                    required
                    value={newUser.password}
                    onChange={e => setNewUser({...newUser, password: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-[#0F4C81]/10 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">System Role</label>
                <select
                  value={newUser.role}
                  onChange={e => setNewUser({...newUser, role: e.target.value as any})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-[#0F4C81] outline-none"
                >
                  <option value="MT">Medical Tech (MT)</option>
                  <option value="MD">Pathologist (MD)</option>
                </select>
              </div>
              <button type="submit" className="w-full py-4 bg-[#0F4C81] text-white rounded-xl font-bold shadow-lg shadow-[#0F4C81]/20 hover:scale-[1.02] transition-transform flex items-center justify-center space-x-2">
                <UserPlus size={18} />
                <span>Authorize Access</span>
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Authorized Personnel</h3>
              <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full">{users.length} Total</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                  <tr>
                    <th className="px-8 py-4">User Details</th>
                    <th className="px-8 py-4">Credential</th>
                    <th className="px-8 py-4">Status</th>
                    <th className="px-8 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map(u => (
                    <tr key={u.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-[#0F4C81] text-white flex items-center justify-center font-bold">
                            {u.name[0]}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{u.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold">{u.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-4 font-mono text-xs text-slate-500">
                        {u.licenseNumber}
                      </td>
                      <td className="px-8 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-600">
                          Active
                        </span>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <button
                          onClick={() => onDeleteUser(u.id)}
                          className="p-2 text-slate-200 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-8 py-16 text-center text-slate-300 italic text-sm">
                        No employees provisioned yet.
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
