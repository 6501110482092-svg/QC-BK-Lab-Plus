/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import IQCPage from './components/IQCPage';
import SettingsPage from './components/SettingsPage';
import AdminPanel from './components/AdminPanel';
import EQAPage from './components/EQAPage';
import { User, QCResult, QCConfig, Instrument, EQARecord } from './types';
import { INSTRUMENTS, QC_CONFIGS } from './constants';

const ADMIN_USER: User = {
  id: 'admin-1',
  name: 'System Admin',
  licenseNumber: 'ADMIN',
  password: 'admin',
  role: 'ADMIN'
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string>();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Dynamic Application Data
  const [results, setResults] = useState<QCResult[]>([]);
  const [configs, setConfigs] = useState<QCConfig[]>(QC_CONFIGS);
  const [instruments, setInstruments] = useState<Instrument[]>(INSTRUMENTS);
  const [eqaRecords, setEqaRecords] = useState<EQARecord[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Initial Load from LocalStorage
  useEffect(() => {
    const loadFromStorage = (key: string, defaultValue: any) => {
      const data = localStorage.getItem(key);
      if (!data) return defaultValue;
      try {
        const parsed = JSON.parse(data);
        return (parsed !== null && parsed !== undefined) ? parsed : defaultValue;
      } catch (e) {
        console.error(`Error loading ${key}:`, e);
        return defaultValue;
      }
    };

    setResults(loadFromStorage('qc_results', []));
    setConfigs(loadFromStorage('qc_configs', QC_CONFIGS));
    setInstruments(loadFromStorage('qc_insts', INSTRUMENTS));
    setUsers(loadFromStorage('qc_users', []));
    setEqaRecords(loadFromStorage('qc_eqa', []));
    
    const savedUser = localStorage.getItem('qc_current_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {}
    }
    
    setIsLoaded(true);
  }, []);

  // 2. Save to LocalStorage (Only after initial load is complete)
  useEffect(() => { 
    if (!isLoaded) return;
    
    localStorage.setItem('qc_results', JSON.stringify(results));
    localStorage.setItem('qc_configs', JSON.stringify(configs));
    localStorage.setItem('qc_insts', JSON.stringify(instruments));
    localStorage.setItem('qc_users', JSON.stringify(users));
    localStorage.setItem('qc_eqa', JSON.stringify(eqaRecords));
  }, [results, configs, instruments, users, eqaRecords, isLoaded]);

  const handleLogin = (license: string, password: string) => {
    if (license === 'ADMIN' && password === 'admin') {
      setUser(ADMIN_USER);
      localStorage.setItem('qc_current_user', JSON.stringify(ADMIN_USER));
      setAuthError(undefined);
      return;
    }

    const found = users.find(u => u.licenseNumber === license);
    if (found && found.password === password) {
      setUser(found);
      localStorage.setItem('qc_current_user', JSON.stringify(found));
      setAuthError(undefined);
    } else {
      setAuthError('Invalid credentials. Access denied.');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('qc_current_user');
  };

  // Inactivity Timer (15 minutes)
  useEffect(() => {
    if (!user) return;

    const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutes in ms
    let timeoutId: number;

    const resetTimer = () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        handleLogout();
        alert('Session expired due to inactivity. Please login again.');
      }, INACTIVITY_LIMIT);
    };

    // Events to track user activity
    const activityEvents = [
      'mousedown', 'mousemove', 'keypress', 
      'scroll', 'touchstart', 'click'
    ];

    activityEvents.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer(); // Initialize timer

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [user]);

  const handleRegister = (newUser: User) => {
    setUsers(prev => [...prev, newUser]);
    setUser(newUser);
    localStorage.setItem('qc_current_user', JSON.stringify(newUser));
  };

  if (!user) {
    return <Auth onLogin={handleLogin} error={authError} />;
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} user={user} onLogout={handleLogout}>
      {activeTab === 'dashboard' && <Dashboard results={results} />}
      
      {activeTab === 'iqc' && (
        <IQCPage 
          results={results} 
          onAddResult={res => setResults(prev => [...prev, res])} 
          onDeleteResult={id => setResults(prev => prev.filter(x => x.id !== id))}
          configs={configs}
          instruments={instruments}
          eqaRecords={eqaRecords}
          currentUser={user}
        />
      )}

      {activeTab === 'eqa' && (
        <EQAPage 
          eqaRecords={eqaRecords}
          onAddEQA={rec => setEqaRecords(prev => [...prev, rec])}
          onDeleteEQA={id => setEqaRecords(prev => prev.filter(x => x.id !== id))}
          configs={configs}
          instruments={instruments}
        />
      )}

      {activeTab === 'personnel' && user.role === 'ADMIN' && (
        <AdminPanel 
          users={users} 
          onAddUser={u => setUsers(prev => [...prev, u])}
          onDeleteUser={id => setUsers(prev => prev.filter(x => x.id !== id))}
        />
      )}

      {activeTab === 'personnel' && user.role !== 'ADMIN' && (
        <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-white rounded-3xl border border-slate-200 p-12">
          <div className="p-4 bg-red-50 text-red-500 rounded-full mb-4">
             <Users size={48} />
          </div>
          <p className="font-black text-xl text-slate-800">การเข้าถึงถูกจำกัด</p>
          <p className="font-medium">เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่มีสิทธิ์จัดการรายชื่อพนักงาน</p>
        </div>
      )}

      {activeTab === 'instruments' && (
        <SettingsPage
          configs={configs}
          instruments={instruments}
          onAddConfig={c => setConfigs(prev => [...prev, c])}
          onAddInstrument={i => setInstruments(prev => [...prev, i])}
          onDeleteConfig={id => setConfigs(prev => prev.filter(x => x.id !== id))}
          onDeleteInstrument={id => setInstruments(prev => prev.filter(x => x.id !== id))}
        />
      )}

      {activeTab === 'settings' && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200">
           <h2 className="text-xl font-bold mb-4">Account Settings</h2>
           <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center">
                 <div>
                    <p className="text-sm font-bold">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.role} - {user.licenseNumber}</p>
                 </div>
                 <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">ACTIVE</span>
              </div>
              <p className="text-xs text-slate-400 italic font-medium">To change password or update info, please contact the Lab Administrator.</p>
           </div>
        </div>
      )}
    </Layout>
  );
}
